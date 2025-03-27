"use server";

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function createEmployee(
  department: string | undefined,
  clerkId: string,
  invitationCode: string
) {
  try {
    const user = await (await clerkClient()).users.getUser(clerkId);
    if (!user || !user.firstName || !user.lastName) {
      throw new Error("User not found.");
    }

    const code = await prisma.code.findFirst({
      where: {
        code: invitationCode,
        used: false,
      },
    });
    if (!code) {
      throw new Error("Invalid Invitation Code.");
    }
    await (
      await clerkClient()
    ).users.updateUserMetadata(user.id, {
      publicMetadata: {
        onboardingCompleted: true,
        role: "EMPLOYEE",
        companyId: code.companyId,
      },
    });

    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "EMPLOYEE",
        department: department || null,
        companyId: code.companyId,
      },
    });

    await prisma.code.update({
      where: {
        id: code.id,
      },
      data: {
        used: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

//it is admin of company Not the admin of the website
export async function createAdmin(
  companyName: string,
  companyWebsite: string,
  companyLogo: string,
  clerkId: string
) {
  try {
    const user = await (await clerkClient()).users.getUser(clerkId);

    if (!user || !user.firstName || !user.lastName) {
      throw new Error("User not found");
    }

    const company = await prisma.company.create({
      data: {
        name: companyName,
        website: companyWebsite,
        logo: companyLogo,
      },
    });

    await (
      await clerkClient()
    ).users.updateUserMetadata(user.id, {
      publicMetadata: {
        onboardingCompleted: true,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
