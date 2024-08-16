const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const corsOptions = {
    origin:["http://localhost:5173","http://localhost:5174"],
    credentials:true,
    OptionSuccessStatus:200,
}
//middleware
app.use(cors(corsOptions))
app.use(express.json())



const uri = `mongodb+srv://${process.env.PRODIFY_USER_NAME}:${process.env.PRODIFY_USER_PASS}@cluster0.2lcaz14.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    const productCollection = client.db('prodify').collection('products');
    
    app.get('/products',async(req, res)=>{
    const result = await productCollection.find().toArray();
    console.log(result);
    res.send(result);
    })
    app.post('/product',async(req, res)=>{
      const  product = req.body;
      console.log(product);
      return;
      const result = await productCollection.insertOne(product)
      res.send(result);
    })
//get product for pagination
     app.get('/products-page',async(req, res)=>{
      const size=parseInt(req.query.size);
      const page=parseInt(req.query.page) -1;
      const filter=req.query.filter;
      const sort=req.query.sort;
      const search=req.query.search;
      // let query = {productName:{$regex:search, $options:'i'}};
        let query = {};
    if (search) {
        query.productName = { $regex: search, $options: 'i' };
    }
      // if (filter) query = {category:filter}
      if (filter) query.category = filter;
      let options = {};
    
        if (sort) {
        options.sort = { price: sort === 'asc' ? 1 : -1 };
    } else {
        options.sort = { creationDateTime: -1 };  // Default to sorting by creationDateTime in descending order
    }

    const result = await productCollection.find(query,options).skip(page * size).limit(size).toArray();
    res.send(result);
    })
//get product for count
     app.get('/products-count',async(req, res)=>{
      const filter=req.query.filter;
      const search=req.query.search;
      // let query = {productName:{$regex:search, $options:'i'}};
        let query = {};
    if (search) {
        query.productName = { $regex: search, $options: 'i' };
    }
      if (filter) query = {category:filter}
    const count = await productCollection.countDocuments(query);
    res.send({count});
    })
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send('Hello from Prodify server')
})

app.listen(port,()=>console.log(`Prodify server runnig on port: ${port}`))