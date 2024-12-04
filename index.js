const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

const PORT =5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
