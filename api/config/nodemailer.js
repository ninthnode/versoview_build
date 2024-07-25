// const nodemailer = require("nodemailer");
// const fs = require("fs");

// const sendMail = async (email, subject, link) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "support@versoview.com",
//         pass: "<password>",
//       },
//     });

//     await transporter.sendMail({
//       from: "VersoView <support@versoview.com>",
//       to: email,
//       subject: subject,
//       text: `Hi,

//       This is email body.

//       Regards,
//       VersoView Team`,
//     });

//     console.log("Email sent successfully");
//   } catch (error) {
//     console.log(error, "Email not sent succesfully");
//   }
// };
// module.exports = { sendMail };

const nodemailer = require("nodemailer");

const sendMail = async (email, subject, link) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'sakar123@zohomail.in',
        pass: 'Pass@221244',
      }
    });
    
    await transporter.sendMail({
      from: "VersoView <sakar123@zohomail.in>",
      to: email,
      subject: subject,
      text: `Reset your password using the following link: ${link}`,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log(error, "Email not sent successfully");
    throw error;
  }
};

module.exports = { sendMail };
