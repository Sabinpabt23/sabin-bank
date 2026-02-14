// types/user.ts
export interface IUser {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
  idType: 'citizenship' | 'driving_license';
  idNumber: string;
  idPhotoPath: string;
  accountNumber: string;
  password: string;
  status: 'pending' | 'active' | 'rejected';
  requestedCard: boolean;
  cardType?: 'VISA' | 'MASTERCARD' | 'AMEX';
  createdAt: Date;
}