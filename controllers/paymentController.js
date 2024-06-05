import stripePackage from "stripe";
import dotenv from "dotenv";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
dotenv.config();
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

//Check out
export const CheckOut = asyncErrrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { orderId, cart, amount, currency } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      // ui_mode: 'embedded',
      success_url: `${process.env.FRONTEND_HOST}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    });
    console.log("Session:", session);
    // Create a payment record
    const payment = new Payment({
      user: id,
      order: orderId,
      paymentIntentId: session.payment_intent,
      amount,
      currency,
      status: "pending",
    });

    await payment.save();
    console.log("Payment Successful");
    res
      .status(200)
      .json({ success: true, clientSecret: session.client_secret });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

//verify payment

export const verifyPayment = asyncErrrorHandler(async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_SECRET_KEY
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update payment status to succeeded
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: session.payment_intent },
        { status: "succeeded" },
        { new: true }
      );

      if (payment) {
        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentInfo.status = true;
          await order.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error in verifyPayment", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});
