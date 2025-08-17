
'use server';

import fetch from 'node-fetch';
import crypto from 'crypto';
import { FB_PIXEL_ID } from '@/lib/fpixel';
import type { Sale } from './types';

const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;

interface UserData {
    client_ip_address: string;
    client_user_agent: string;
    em?: string[]; // Email
    ph?: string[]; // Phone
    fbc?: string;  // Click ID
    fbp?: string;  // Browser ID
}

interface EventData {
    event_name: string;
    event_time: number;
    event_source_url: string;
    event_id: string;
    user_data: UserData;
    custom_data: {
        currency: string;
        value: number;
        content_ids: string[];
        content_type: 'product';
        num_items: number;
    };
    action_source: 'website';
}

// Hashes data using SHA256, as required by Facebook
const hash = (data: string) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

export async function sendPurchaseEvent(sale: Sale, eventId: string, userAgent: string | null, clientIp: string | null) {
    if (!ACCESS_TOKEN || !FB_PIXEL_ID) {
        console.warn('Facebook CAPI credentials are not set. Skipping server event.');
        return;
    }

    // Prepare user data. Hash personal info.
    const userData: UserData = {
        client_user_agent: userAgent || '',
        client_ip_address: clientIp || '',
    };
    if (sale.customerEmail) {
        userData.em = [hash(sale.customerEmail.toLowerCase())];
    }
    if (sale.customerPhone) {
        // Simple sanitization for phone number
        const sanitizedPhone = sale.customerPhone.replace(/[^0-9]/g, '');
        if (sanitizedPhone) {
            userData.ph = [hash(sanitizedPhone)];
        }
    }
    
    // Construct the event payload
    const eventData: EventData = {
        event_name: 'Purchase',
        event_time: Math.floor(new Date(sale.date).getTime() / 1000),
        event_source_url: 'https://freesia-finds-pos-82fbs.web.app/checkout', // Your checkout page URL
        event_id: eventId, // Use the unique event ID for deduplication
        action_source: 'website',
        user_data: userData,
        custom_data: {
            currency: 'BDT',
            value: sale.total,
            content_ids: sale.items.map(item => item.productId),
            content_type: 'product',
            num_items: sale.items.reduce((acc, item) => acc + item.quantity, 0),
        },
    };

    const url = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [eventData] }),
        });

        const responseBody = await response.json();

        if (!response.ok) {
            console.error('Error sending CAPI event to Facebook:', responseBody);
        } else {
            console.log('Successfully sent CAPI Purchase event for sale:', sale.id, 'with event_id:', eventId);
        }
    } catch (error) {
        console.error('Failed to send Facebook CAPI event:', error);
    }
}
