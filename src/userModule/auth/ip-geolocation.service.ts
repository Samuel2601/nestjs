/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IpGeolocationService {
    async getGeolocation(ip: string) {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching geolocation:', error);
            return null;
        }
    }
}