import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const userData = body.formData;
    console.log(userData);
    const { email, password } = userData;
    //Confirm data exists
    if (!email || !password) {
      console.log('All fields are required.');
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // check for duplicate emails
    const duplicate = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (duplicate) {
      return NextResponse.json({ message: 'Duplicate Email' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.hashedPassword = hashedPassword;

    const user = await prisma.user.create({
      data: {
        email,
        // password: userData.password, // Assuming your Prisma model has a 'password' field
        hashedPassword: hashedPassword, // Use the hashed password here
      },
    });
    console.log(user);
    return NextResponse.json({ message: 'User Created.' }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}
