import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import mongoose from 'mongoose';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Changed type to Promise
) {
  try {
    // Await the params
    const { id } = await params;
    console.log("🔵 API called with ID:", id);
    
    await connectDB();
    
    const { action } = await request.json();
    console.log("🟡 Action:", action);
    
    const cardId = id;
    console.log("🟢 Looking for card with ID:", cardId);

    // Find the card
    const card = await Card.findById(cardId);
    
    if (!card) {
      console.log("🔴 Card not found for ID:", cardId);
      return NextResponse.json(
        { error: 'Card request not found' },
        { status: 404 }
      );
    }

    console.log("✅ Card found in DB:", {
      id: card._id.toString(),
      currentStatus: card.status,
      requestStatus: card.requestStatus,
      cardHolder: card.cardHolder
    });

    if (action === 'approve') {
      console.log("🟡 Approving card...");
      
      // Generate real card details
      const cardNumber = generateCardNumber();
      const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const expiryYear = String(new Date().getFullYear() + 3).slice(-2);
      const cvv = generateCVV();

      console.log("🟡 Generated card details:", {
        cardNumber: cardNumber.slice(-4),
        expiry: `${expiryMonth}/${expiryYear}`,
        cvv: '***'
      });

      // Update card with real details
      card.cardNumber = cardNumber;
      card.expiryMonth = expiryMonth;
      card.expiryYear = expiryYear;
      card.cvv = cvv;
      card.status = 'active';
      card.requestStatus = 'approved';
      card.approvedAt = new Date();
      
      console.log("🟡 Saving card to database...");
      await card.save();
      console.log("✅ Card saved successfully!");

      // Verify the save worked
      const verifyCard = await Card.findById(cardId);
      console.log("✅ Verification - Card after save:", {
        status: verifyCard?.status,
        requestStatus: verifyCard?.requestStatus,
        hasCardNumber: !!verifyCard?.cardNumber
      });

      return NextResponse.json({
        success: true,
        message: 'Card approved successfully',
        card: {
          id: card._id,
          cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
          expiry: `${expiryMonth}/${expiryYear}`,
        },
      });
      
    } else if (action === 'reject') {
      console.log("🟡 Rejecting card...");
      card.requestStatus = 'rejected';
      card.status = 'rejected';
      await card.save();
      console.log("✅ Card rejected successfully");
      
      return NextResponse.json({
        success: true,
        message: 'Card request rejected',
      });
    }

  } catch (error) {
    console.error('❌ Error processing card request:', error);
    return NextResponse.json(
      { error: 'Something went wrong: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

function generateCardNumber() {
  let number = '';
  for (let i = 0; i < 16; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString();
}