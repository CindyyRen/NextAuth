import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const userData = body.formData;
    console.log(userData);
    //Confirm data exists
    if (!userData?.email || !userData.password) {
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

    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.hashPassword = hashPassword;

    const user = await prisma.user.create(userData);
    console.log(user);
    return NextResponse.json({ message: 'User Created.' }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}
