import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

/**
 * Create a Stripe customer for a company
 * @param email - Company email
 * @param name - Company name
 * @param companyId - Internal company ID
 * @returns Stripe customer ID
 */
export const createStripeCustomer = async (
  email: string,
  name: string,
  companyId: string
): Promise<string> => {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn(
        "⚠️ Stripe secret key not configured. Skipping customer creation."
      );
      throw new Error("Stripe is not configured");
    }

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        companyId,
      },
    });

    console.log(
      `✅ Created Stripe customer: ${customer.id} for company: ${name}`
    );
    return customer.id;
  } catch (error) {
    console.error("❌ Failed to create Stripe customer:", error);
    throw error;
  }
};

/**
 * Get Stripe customer by ID
 * @param customerId - Stripe customer ID
 * @returns Stripe customer object
 */
export const getStripeCustomer = async (
  customerId: string
): Promise<Stripe.Customer> => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe is not configured");
    }

    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error("Customer has been deleted");
    }

    return customer as Stripe.Customer;
  } catch (error) {
    console.error("❌ Failed to retrieve Stripe customer:", error);
    throw error;
  }
};

/**
 * Update Stripe customer
 * @param customerId - Stripe customer ID
 * @param data - Data to update
 * @returns Updated Stripe customer object
 */
export const updateStripeCustomer = async (
  customerId: string,
  data: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe is not configured");
    }

    const customer = await stripe.customers.update(customerId, data);
    console.log(`✅ Updated Stripe customer: ${customerId}`);
    return customer;
  } catch (error) {
    console.error("❌ Failed to update Stripe customer:", error);
    throw error;
  }
};

/**
 * Delete Stripe customer
 * @param customerId - Stripe customer ID
 * @returns Deleted Stripe customer object
 */
export const deleteStripeCustomer = async (
  customerId: string
): Promise<Stripe.Customer> => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe is not configured");
    }

    const deletedCustomer = await stripe.customers.del(customerId);

    if (!("deleted" in deletedCustomer) || !deletedCustomer.deleted) {
      throw new Error("Failed to delete Stripe customer");
    }

    console.log(`✅ Deleted Stripe customer: ${customerId}`);
    // Return a partial object to satisfy the Promise<Stripe.Customer> type.
    // You may need to adjust this to fit your use case, but Stripe will only return a DeletedCustomer.
    return {
      id: deletedCustomer.id,
      object: deletedCustomer.object,
      deleted: true,
    } as unknown as Stripe.Customer;
  } catch (error) {
    console.error("❌ Failed to delete Stripe customer:", error);
    throw error;
  }
};
