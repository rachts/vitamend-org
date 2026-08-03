import mongoose from 'mongoose';
import { Medicine } from '../models/Medicine';
import { Inventory } from '../models/Inventory';
import { VerificationLog } from '../models/VerificationLog';
import User from '../models/User';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function seedDemoData() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean existing dummy data if necessary or just append. We will clear for a fresh demo.
    console.log('Clearing old collections...');
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});
    await VerificationLog.deleteMany({});
    
    // Check if an admin exists, if not create one
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Demo Pharmacist',
        email: 'pharmacist@vitamend.org',
        password: 'password123',
        role: 'admin',
      });
      console.log('Created demo admin user');
    }

    let donor = await User.findOne({ role: 'donor' });
    if (!donor) {
      donor = await User.create({
        name: 'Good Samaritan',
        email: 'donor@example.com',
        password: 'password123',
        role: 'donor',
      });
      console.log('Created demo donor user');
    }

    const meds = [
      {
        name: 'Dolo 650',
        genericName: 'Paracetamol',
        dosage: '650mg',
        batchNumber: 'DL650-24A',
        manufacturer: 'Micro Labs Ltd',
        quantity: 5,
        status: 'approved',
        confidence: 98.5,
        expiryOffset: 365, // days from now
      },
      {
        name: 'Augmentin 625 Duo',
        genericName: 'Amoxicillin + Clavulanic Acid',
        dosage: '625mg',
        batchNumber: 'AUG-X982',
        manufacturer: 'GSK',
        quantity: 2,
        status: 'distributed',
        confidence: 95.2,
        expiryOffset: 120, 
      },
      {
        name: 'Glycomet-GP 2',
        genericName: 'Glimepiride + Metformin',
        dosage: '2mg/500mg',
        batchNumber: 'GLY-773B',
        manufacturer: 'USV Pvt Ltd',
        quantity: 10,
        status: 'under_review',
        confidence: 89.1,
        expiryOffset: 45, 
      },
      {
        name: 'Telma 40',
        genericName: 'Telmisartan',
        dosage: '40mg',
        batchNumber: 'TEL-40-11',
        manufacturer: 'Glenmark Pharmaceuticals',
        quantity: 3,
        status: 'rejected',
        confidence: 72.4,
        expiryOffset: -10, // Expired
      }
    ];

    for (const data of meds) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + data.expiryOffset);

      const med = await Medicine.create({
        donorId: donor._id.toString(),
        name: data.name,
        genericName: data.genericName,
        dosage: data.dosage,
        batchNumber: data.batchNumber,
        manufacturer: data.manufacturer,
        quantity: data.quantity,
        expiryDate,
        status: data.status,
        verificationResult: {
          confidence: data.confidence,
          isTampered: false,
          isDuplicate: false,
          isExpired: data.expiryOffset < 0,
          isRecalled: false,
          aiReasoning: 'Successfully extracted text matching known pharmaceutical database. No visual tampering detected.',
          extractedData: {
            name: data.name,
            batchNumber: data.batchNumber,
          }
        },
        reviewNotes: data.status === 'rejected' ? 'Item is past its expiration date.' : 
                     data.status === 'approved' || data.status === 'distributed' ? 'Verified by pharmacist against CDSCO database.' : '',
        reviewedBy: ['approved', 'rejected', 'distributed'].includes(data.status) ? admin._id.toString() : undefined,
      });

      // Add Verification Logs for the Ledger
      const stages = ['ocr', 'ai_check', 'db_check', 'decision'];
      for (let i=0; i<stages.length; i++) {
        await VerificationLog.create({
          medicineId: med._id.toString(),
          stage: stages[i],
          status: 'success',
          details: { message: `Completed stage ${stages[i]} successfully.` },
          confidence: data.confidence - (i * 0.5),
          createdAt: new Date(Date.now() - (1000 * 60 * 60 * (24 - i))), // past few hours
        });
      }

      if (['approved', 'rejected', 'distributed'].includes(data.status)) {
         await VerificationLog.create({
            medicineId: med._id.toString(),
            stage: 'manual_review',
            status: data.status === 'rejected' ? 'failure' : 'success',
            details: { decision: data.status, notes: med.reviewNotes },
            confidence: 100,
            createdAt: new Date(Date.now() - (1000 * 60 * 30)),
          });
      }

      // Add to Inventory if approved or distributed
      if (['approved', 'distributed'].includes(data.status)) {
        await Inventory.create({
          medicineId: med._id.toString(),
          name: med.name,
          genericName: med.genericName,
          quantity: med.quantity,
          batchNumber: med.batchNumber,
          expiryDate: med.expiryDate,
          manufacturer: med.manufacturer,
          location: data.status === 'distributed' ? 'Delivered to AIIMS, New Delhi' : 'Main Warehouse',
          status: data.status === 'distributed' ? 'distributed' : 'available',
          donationId: med._id.toString(),
        });
      }
    }

    console.log('Successfully seeded VitaMend database with demo content.');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDemoData();
