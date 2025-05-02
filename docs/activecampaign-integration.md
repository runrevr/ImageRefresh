# ActiveCampaign Integration

This document outlines the integration between our application and ActiveCampaign for marketing automation and email campaigns.

## Overview

The ActiveCampaign integration allows the application to:

1. Add new users as contacts in ActiveCampaign when they register
2. Update contact information when users change their profile details
3. Tag contacts based on their membership status (Free, Basic, Premium)
4. Update custom fields with subscription and membership information
5. Sync user activity with ActiveCampaign for targeted marketing campaigns

## Configuration

The integration requires the following environment variables:

- `ACTIVECAMPAIGN_API_KEY`: Your ActiveCampaign API key
- `ACTIVECAMPAIGN_BASE_URL`: Your ActiveCampaign API URL (e.g., https://youraccountname.api-us1.com)
- `ACTIVECAMPAIGN_MEMBERSHIP_LIST`: (Optional) The ID of the list to add all members to
- `ACTIVECAMPAIGN_FREE_USER_TAG`: (Optional) Custom tag name for free users (default: "free")
- `ACTIVECAMPAIGN_CORE_USER_TAG`: (Optional) Custom tag name for core subscribers (default: "core")
- `ACTIVECAMPAIGN_PLUS_USER_TAG`: (Optional) Custom tag name for plus subscribers (default: "plus")
- `ACTIVECAMPAIGN_TRIAL_TAG`: (Optional) Custom tag name for users in trial period (default: "trial")
- `ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD`: (Optional) Custom field name for membership status (default: "Membership Status")

## Implementation Details

### ActiveCampaign Client (`server/activecampaign.ts`)

Low-level client that handles API communication with ActiveCampaign, including:

- Creating and updating contacts
- Managing tags
- Adding contacts to lists
- Updating custom fields

### ActiveCampaign Service (`server/activecampaign-service.ts`)

Higher-level service that provides business-logic operations:

- Adding new users as contacts
- Updating membership status and tags
- Handling subscription status changes

### Integration Points

The integration is triggered at the following points:

1. User Registration - When a user registers, they are added as a contact with the "#free" tag
2. Subscription Changes - When a user subscribes or changes their subscription tier, their tags and membership status are updated
3. Stripe Webhook Events - When subscription events occur through Stripe, the membership status is updated accordingly

### Testing

You can test the ActiveCampaign integration using the test endpoint:

```
GET /api/admin/test-activecampaign
```

This endpoint will:
1. Check if ActiveCampaign is properly configured
2. Create or update the current user as a contact
3. Update membership status and tags
4. Return the results of these operations

## Customization

To customize the integration:

1. Modify the tag names in the environment variables to match your ActiveCampaign setup
2. Create custom fields in ActiveCampaign to store additional user information
3. Update the `activecampaign-service.ts` file to include additional data points as needed

## Troubleshooting

Common issues:

1. **Contact not created** - Check API key and base URL
2. **Tags not applied** - Ensure the tag exists in ActiveCampaign or check permission settings
3. **Custom fields not updated** - Verify the custom field exists and is properly referenced

If errors occur during the integration process, check the server logs for detailed error messages from the ActiveCampaign API.