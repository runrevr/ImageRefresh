import { activeCampaign, ActiveCampaignContact } from './activecampaign';
import { log } from './vite';
import { User, Membership } from '../shared/schema';

// Environment variables with defaults for development
const MEMBERSHIP_LIST_ID = process.env.ACTIVECAMPAIGN_MEMBERSHIP_LIST || '';
const FREE_USER_TAG = process.env.ACTIVECAMPAIGN_FREE_USER_TAG || 'Free User';
const BASIC_USER_TAG = process.env.ACTIVECAMPAIGN_BASIC_USER_TAG || 'Basic Subscription';
const PREMIUM_USER_TAG = process.env.ACTIVECAMPAIGN_PREMIUM_USER_TAG || 'Premium Subscription';
const MEMBERSHIP_STATUS_FIELD = process.env.ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD || 'Membership Status';

/**
 * Service for ActiveCampaign operations
 */
export class ActiveCampaignService {
  /**
   * Check if ActiveCampaign integration is configured
   */
  isConfigured(): boolean {
    return activeCampaign.isConfigured();
  }

  /**
   * Add or update a contact in ActiveCampaign when a user registers
   * @param user User object from the database
   */
  async addOrUpdateContact(user: any): Promise<boolean> {
    if (!this.isConfigured()) {
      log('ActiveCampaign not configured, skipping contact add/update', 'activecampaign-service');
      return false;
    }

    try {
      // Ensure we have valid data before sending to ActiveCampaign
      if (!user.email) {
        log('Cannot add contact to ActiveCampaign: missing email', 'activecampaign-service');
        return false;
      }

      const contactData: ActiveCampaignContact = {
        email: user.email,
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
      };

      const result = await activeCampaign.createOrUpdateContact(contactData);
      return !!result;
    } catch (error) {
      log(`Error in addOrUpdateContact: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign-service');
      return false;
    }
  }

  /**
   * Add appropriate tags to a user based on their membership status
   * @param user User object from the database
   * @param membership Optional membership object if available
   */
  async updateMembershipStatus(user: any, membership?: Membership): Promise<boolean> {
    if (!this.isConfigured()) {
      log('ActiveCampaign not configured, skipping membership update', 'activecampaign-service');
      return false;
    }

    try {
      // Validate required fields
      if (!user || !user.email) {
        log('Cannot update membership status: invalid user data', 'activecampaign-service');
        return false;
      }

      // Find the contact in ActiveCampaign
      const contact = await activeCampaign.findContactByEmail(user.email);
      if (!contact) {
        log(`Contact not found for email: ${user.email}`, 'activecampaign-service');
        return false;
      }

      // Determine membership tier
      const membershipTier = membership?.planType || user.subscriptionTier || 'free';
      const membershipStatus = membership?.status || user.subscriptionStatus || 'inactive';
      
      // Add contact to membership list
      if (MEMBERSHIP_LIST_ID) {
        await activeCampaign.addContactToList(contact.id, MEMBERSHIP_LIST_ID);
      }

      // Add appropriate tag based on membership tier
      let tagName = FREE_USER_TAG;
      if (membershipTier === 'premium') {
        tagName = PREMIUM_USER_TAG;
      } else if (membershipTier === 'basic') {
        tagName = BASIC_USER_TAG;
      }
      
      const tagId = await activeCampaign.findOrCreateTag(tagName);
      if (tagId) {
        await activeCampaign.addTagToContact(contact.id, tagId);
      }
      
      // Update membership status custom field if configured
      if (MEMBERSHIP_STATUS_FIELD) {
        await activeCampaign.createOrUpdateContact({
          email: user.email,
          fieldValues: [{
            field: MEMBERSHIP_STATUS_FIELD,
            value: membershipStatus
          }]
        });
      }
      
      log(`Updated membership status for ${user.email}: ${membershipTier} (${membershipStatus})`, 'activecampaign-service');
      return true;
    } catch (error) {
      log(`Error in updateMembershipStatus: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign-service');
      return false;
    }
  }

  /**
   * Handle subscription status change
   * @param user User object from the database
   * @param status New subscription status
   */
  async updateSubscriptionStatus(user: any, status: string): Promise<boolean> {
    if (!this.isConfigured()) {
      log('ActiveCampaign not configured, skipping subscription update', 'activecampaign-service');
      return false;
    }

    try {
      // Validate required fields
      if (!user || !user.email) {
        log('Cannot update subscription status: invalid user data', 'activecampaign-service');
        return false;
      }

      // Find or create contact
      const contactData: ActiveCampaignContact = {
        email: user.email,
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        fieldValues: [{
          field: MEMBERSHIP_STATUS_FIELD,
          value: status
        }]
      };

      const result = await activeCampaign.createOrUpdateContact(contactData);
      
      // Update tags based on subscription tier
      if (result && user.subscriptionTier) {
        await this.updateMembershipStatus(user);
      }
      
      return !!result;
    } catch (error) {
      log(`Error in updateSubscriptionStatus: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign-service');
      return false;
    }
  }
}

// Singleton instance
export const activeCampaignService = new ActiveCampaignService();