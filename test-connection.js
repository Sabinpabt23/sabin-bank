const mongoose = require('mongoose');

const uri = 'mongodb+srv://sabin:rU0pLIMGRUBXYqrR@cluster0.zktyuuo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });