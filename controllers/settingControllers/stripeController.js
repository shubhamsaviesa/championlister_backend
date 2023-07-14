import Stripe from 'stripe';
// const stripe = require("stripe")('sk_test_51LokcHSE2YZfdF7hkLWRfp4HEptYJWC675GUgByJZzB2h5rFoyFfsOSK7HAnRoiYgD09LOV4ZEfmdZXy4Hk5IrFe008DX3iYB4')
const stripe = new Stripe('sk_test_51LokcHSE2YZfdF7hkLWRfp4HEptYJWC675GUgByJZzB2h5rFoyFfsOSK7HAnRoiYgD09LOV4ZEfmdZXy4Hk5IrFe008DX3iYB4');

export const stripeController = async (req, res) => {
  console.log(1111,req.body)
    let status, error;
    const { token, amount } = req.body;
  //   const session = await stripe.checkout.sessions.create({
  //     payment_method_types: ['{{ PAYMENT_METHOD_TYPE }}'],
  //     line_items: [{
  //       name: 'T-shirt',
  //       description: 'Comfortable cotton t-shirt',
  //       images: ['https://example.com/t-shirt.png'],
  //       amount: 2000,
  //       currency: 'usd',
  //       price_data: {
  //         currency: 'usd',
  //         unit_amount: 2000,
  //         product_data: {
  //           name: 'T-shirt',
  //           description: 'Comfortable cotton t-shirt',
  //           images: ['https://example.com/t-shirt.png'],
  //         },
  //       },
  //       quantity: 1,
  //     }],
  //     mode: 'payment',
  //     success_url: 'http://localhost:3000/billingSetting',
  //     cancel_url: 'http://localhost:3000/billingSetting',
  //   });
  // console.log("sess", session)
  //   res.redirect(303, session.url);
  
      //  try{
      //     const customer = await stripe.customers.create({
      //       email:token.email,
      //       source:token.id
      //     })
      //     const payment = await stripe.charges.create({
      //       amount:amount,
      //       currency:'inr',
      //       customer:customer.id,
      //       receipt_email:token.email
      //     },{idempotencyKey:"asdfghjkl"})
      //     console.log("pay", payment)
      //  }catch(e){
      //   console.log(e)
      //  }


    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            payment_method_types: ['card', 'amex', 'paper_check']
            // confirm: true,
          })
          console.log(paymentIntent)
      status = 'success';
    } catch (error) {
      console.log(error);
      status = 'Failure';
    }
    res.json({ error, status });
    
  }

  


  

