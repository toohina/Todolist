//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://admin-toohina:test123@cluster0.kbrib.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

//Default items
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

//array to save list item names
var items;

app.get("/", function(req, res) {

  //Finding items in todolist items
res.redirect("/"+"Home");
});

app.get("/:customName", function(req, res) {
  if (req.params.customName != "favicon.ico") {
    const customName = _.capitalize(req.params.customName);
    List.findOne({
      name: customName
    }, function(err, foundList) {
      if (err) console.log(err);
      else {
        if (!foundList) {
          const newList = new List({
            name: customName,
            items: defaultItems
          });
          newList.save();
          res.redirect("/" + customName);
        } else {
          List.findOne({
            name: customName
          }, function(err, foundList) {
            if (err) {
              console.log(err);
            } else {
              res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
              });
            }
          });
        }
      }
    });
  }
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const title = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if (title === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: title
    }, function(err, foundList) {
      if (err) console.log(err);
      else {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + title);
      }
    });
  }

});

app.post("/delete", function(req, res) {
  var idItem = req.body.checkBox;
  var listN = req.body.listName;
  if (listN === "Today") {
    Item.deleteOne({
      _id: idItem
    }, function(err) {
      if (err) console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOne({
      name: listN
    }, function(err, foundList) {
      if (err) {
        console.log(err);
      } else {
        List.findOneAndUpdate({
          name: listN
        }, {
          $pull: {
            items: {
              _id: idItem
            }
          }
        }, function(err, found) {
          if (err) console.log(err);
          else {
            res.redirect("/" + listN);
          }
        });
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
