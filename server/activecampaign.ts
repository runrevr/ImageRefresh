import axios from 'axios';
import { log } from './vite';

// ActiveCampaign API client for managing contacts and tags
export interface ActiveCampaignContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  fieldValues?: Array<{field: string, value: string}>; // Custom fields
}

export interface ActiveCampaignTag {
  name: string;
  tagType?: string;
  description?: string;
}

/**
 * ActiveCampaign client for interacting with the ActiveCampaign API
 */
export class ActiveCampaignClient {
  private baseUrl: string;
  private apiKey: string;
  private api: ReturnType<typeof axios.create>;

  constructor() {
    this.baseUrl = process.env.ACTIVECAMPAIGN_BASE_URL || '';
    this.apiKey = process.env.ACTIVECAMPAIGN_API_KEY || '';
    
    console.log('ActiveCampaign Config:', {
      baseUrlSet: !!this.baseUrl,
      apiKeySet: !!this.apiKey,
      baseUrlValue: this.baseUrl ? `${this.baseUrl.slice(0, 10)}...` : 'not set',
      apiKeyValue: this.apiKey ? `${this.apiKey.slice(0, 5)}...` : 'not set'
    });
    
    // Create an Axios instance for API requests
    this.api = axios.create({
      baseURL: this.baseUrl + '/api/3',
      headers: {
        'Api-Token': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Check if ActiveCampaign is configured with valid credentials
   */
  isConfigured(): boolean {
    const configured = !!(this.baseUrl && this.apiKey);
    console.log('ActiveCampaign isConfigured check:', {
      baseUrl: this.baseUrl ? `${this.baseUrl.slice(0, 20)}...` : 'not set',
      apiKey: this.apiKey ? `${this.apiKey.slice(0, 5)}...` : 'not set',
      result: configured
    });
    return configured;
  }

  /**
   * Create or update a contact in ActiveCampaign
   * @param contact The contact data to create or update
   * @returns The contact data if successful, null if failed
   */
  async createOrUpdateContact(contact: ActiveCampaignContact): Promise<any> {
    if (!this.isConfigured()) {
      log('ActiveCampaign API not configured', 'activecampaign');
      return null;
    }

    try {
      // First check if contact exists
      const existingContact = await this.findContactByEmail(contact.email);
      
      if (existingContact) {
        // Update existing contact
        const response = await this.api.put(`/contacts/${existingContact.id}`, {
          contact: {
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone
          }
        });
        
        // Update custom fields if provided
        if (contact.fieldValues && contact.fieldValues.length > 0) {
          await this.updateContactCustomFields(existingContact.id, contact.fieldValues);
        }
        
        log(`Contact updated: ${contact.email}`, 'activecampaign');
        return response.data;
      } else {
        // Create new contact
        const response = await this.api.post('/contacts', {
          contact: {
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone
          }
        });
        
        // Set custom fields if provided
        if (contact.fieldValues && contact.fieldValues.length > 0 && response.data?.contact?.id) {
          await this.updateContactCustomFields(response.data.contact.id, contact.fieldValues);
        }
        
        log(`Contact created: ${contact.email}`, 'activecampaign');
        return response.data;
      }
    } catch (error) {
      log(`Error creating/updating contact: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      return null;
    }
  }

  /**
   * Find a contact by email
   * @param email The email address to search for
   * @returns The contact data if found, null if not found
   */
  async findContactByEmail(email: string): Promise<any> {
    if (!this.isConfigured()) {
      log('ActiveCampaign API not configured', 'activecampaign');
      return null;
    }

    try {
      const response = await this.api.get(`/contacts?filters[email]=${encodeURIComponent(email)}`);
      if (response.data?.contacts?.length > 0) {
        return response.data.contacts[0];
      }
      return null;
    } catch (error) {
      log(`Error finding contact: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      return null;
    }
  }

  /**
   * Update custom fields for a contact
   * @param contactId The ID of the contact
   * @param fieldValues Array of custom field values
   */
  private async updateContactCustomFields(contactId: string | number, fieldValues: Array<{field: string, value: string}>): Promise<void> {
    // Need to get field IDs first, as ActiveCampaign requires the field ID
    for (const fieldValue of fieldValues) {
      try {
        // Find the field ID by name
        const fieldsResponse = await this.api.get(`/fields?filters[title]=${encodeURIComponent(fieldValue.field)}`);
        if (fieldsResponse.data?.fields?.length > 0) {
          const fieldId = fieldsResponse.data.fields[0].id;
          
          // Update the field value
          await this.api.post('/fieldValues', {
            fieldValue: {
              contact: contactId,
              field: fieldId,
              value: fieldValue.value
            }
          });
        }
      } catch (error) {
        log(`Error updating custom field ${fieldValue.field}: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      }
    }
  }

  /**
   * Add a tag to a contact
   * @param contactId The ID of the contact
   * @param tagId The ID of the tag
   */
  async addTagToContact(contactId: string | number, tagId: string | number): Promise<any> {
    if (!this.isConfigured()) {
      log('ActiveCampaign API not configured', 'activecampaign');
      return null;
    }

    try {
      const response = await this.api.post('/contactTags', {
        contactTag: {
          contact: contactId,
          tag: tagId
        }
      });
      
      log(`Tag ${tagId} added to contact ${contactId}`, 'activecampaign');
      return response.data;
    } catch (error) {
      log(`Error adding tag to contact: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      return null;
    }
  }

  /**
   * Find or create a tag
   * @param tagName The name of the tag
   * @returns The tag ID if successful, null if failed
   */
  async findOrCreateTag(tagName: string): Promise<string | null> {
    if (!this.isConfigured()) {
      log('ActiveCampaign API not configured', 'activecampaign');
      return null;
    }

    try {
      // Search for existing tag
      const tagsResponse = await this.api.get(`/tags?filters[name]=${encodeURIComponent(tagName)}`);
      
      if (tagsResponse.data?.tags?.length > 0) {
        return tagsResponse.data.tags[0].id;
      }
      
      // Create tag if not found
      const createResponse = await this.api.post('/tags', {
        tag: {
          tag: tagName,
          tagType: 'contact',
          description: `Auto-created tag for ${tagName}`
        }
      });
      
      if (createResponse.data?.tag?.id) {
        log(`Tag created: ${tagName}`, 'activecampaign');
        return createResponse.data.tag.id;
      }
      
      return null;
    } catch (error) {
      log(`Error finding/creating tag: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      return null;
    }
  }

  /**
   * Add a contact to a list
   * @param contactId The ID of the contact
   * @param listId The ID of the list
   */
  async addContactToList(contactId: string | number, listId: string | number): Promise<any> {
    if (!this.isConfigured()) {
      log('ActiveCampaign API not configured', 'activecampaign');
      return null;
    }

    try {
      const response = await this.api.post('/contactLists', {
        contactList: {
          contact: contactId,
          list: listId,
          status: 1 // 1 = subscribed
        }
      });
      
      log(`Contact ${contactId} added to list ${listId}`, 'activecampaign');
      return response.data;
    } catch (error) {
      log(`Error adding contact to list: ${error instanceof Error ? error.message : String(error)}`, 'activecampaign');
      return null;
    }
  }
}

// Singleton instance
export const activeCampaign = new ActiveCampaignClient();