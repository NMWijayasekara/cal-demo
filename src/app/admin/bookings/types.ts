export type Booking = {
    id: number;
    userId: number;
    description: string;
    eventTypeId: number;
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: Attendee[];
    user: User;
    metadata: Record<string, any>;
    status: BookingStatus;
    responses: {
        email: string;
        name: string;
        location: {
            optionValue: string;
            value: string;
        };
    };
};

export type Attendee = {
    email: string;
    name: string;
    timeZone: string;
    locale: string;
};

export type User = {
    email: string;
    name: string;
    timeZone: string;
    locale: string;
};

export enum BookingStatus {
    CANCELLED = "CANCELLED",
    ACCEPTED = "ACCEPTED",
    PENDING = "PENDING",
}   
