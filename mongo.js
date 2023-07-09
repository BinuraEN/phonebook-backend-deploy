const mongoose = require("mongoose");

//
if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit();
}

const password = process.argv[2];

const url = `mongodb+srv://binuraen:${password}@fullstackopentest.wzwzg9e.mongodb.net/PhoneBookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

if (process.argv.length === 3) {
  //print all entries
  console.log("phonebook:");
  Contact.find()
    .then((result) => {
      result.forEach((contact) => {
        console.log(`${contact.name}  ${contact.number}`);
      });
      mongoose.connection.close();
    })
    .catch((err) => {
      console.log("error: ", err);
    });
} else if (process.argv.length === 5) {
  //add contact
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4],
  });

  contact
    .save()
    .then((result) => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      mongoose.connection.close();
    })
    .catch((err) => {
      console.log("error: ", err);
    });
}
