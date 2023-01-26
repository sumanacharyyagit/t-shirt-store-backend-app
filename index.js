require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT;



app.listen(PORT, (req, res) => {
    console.log(`App listening at http://localhost:${PORT}`);
})