const nodemon = require("nodemon");
const dbc = require("./dbc");
const conn = dbc("tmpfile");

const note = conn.model("Note")({
  content: "HTML is Easy",
  date: new Date(),
  important: true,
});

note
  .save()
  .then((result) => {
    console.log("note saved!");
  })
  .then(() => {
    return conn.model("Note").findOne({});
  })
  .then((result) => {
    console.log(result);
    conn.close();
  });
