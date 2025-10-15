import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing Svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Clerk webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new NextResponse("Error: Verification error", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new NextResponse("Error: Missing required user data", {
        status: 400,
      });
    }

    try {
      // Create user in database
      await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          role: "CUSTOMER", // Default role
        },
      });

      console.log(`✅ User created: ${email_addresses[0].email_address}`);
    } catch (error) {
      console.error("Error creating user in database:", error);
      // If user already exists (race condition), that's okay
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        console.log("User already exists, skipping creation");
      } else {
        return new NextResponse("Error: Database error", { status: 500 });
      }
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id) {
      return new NextResponse("Error: Missing user ID", { status: 400 });
    }

    try {
      // Update user in database
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses?.[0]?.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });

      console.log(`✅ User updated: ${id}`);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new NextResponse("Error: Database error", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new NextResponse("Error: Missing user ID", { status: 400 });
    }

    try {
      // Soft delete or hard delete user
      // For this implementation, we'll hard delete
      await db.user.delete({
        where: { clerkId: id },
      });

      console.log(`✅ User deleted: ${id}`);
    } catch (error) {
      console.error("Error deleting user from database:", error);
      return new NextResponse("Error: Database error", { status: 500 });
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
