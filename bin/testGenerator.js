const numOfCases = 5;          //number of cases in the test
const maxCaseComplexity = 1;    //max case complexity 1-Low, 2-Medium, 3-High

const mongoose = require('mongoose');
const TestCase = require('../models/testCases');
const Test = require('../models/tests');

const dbName = 'diagram-logic';
mongoose.connect(`mongodb://localhost/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const test = {   
  testName: "",    
  complexity: "",
  cases: []
};

console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

//Count tests

//var numberOfTests = Test.countDocuments({}, function (err, count) {
//  console.log("Number of tests stored in DB: " + count);
//});

//Getting max value
let maxTestName = 0;
Test 
  .findOne({})
  .sort('-testName')   //getting max
  .exec(function (err, testMax) {
    maxTestName = testMax.testName;
    console.log("Max testName is: " + maxTestName + " and the test ID is: " + maxTestName);

    TestCase.find()
    .then (docs => {
     createTest(docs);
     //mongoose.connection.close();
    });

});   


function createTest(cases) {
  test.cases = [];
  console.log("Number of cases in DB: " + cases.length);  

  while (test.cases.length < numOfCases) {
    n = Math.floor(Math.random() * cases.length);
    caseId = cases[n]._id;
    cx = cases[n].complexity;
    //validation
    if (test.cases.includes(caseId) 
        || (maxCaseComplexity === 1 && cx !== "Low")
        || (maxCaseComplexity === 2 && cx === "High")) 
        continue;
    test.cases.push(caseId);
  }
 
  test.complexity = (maxCaseComplexity === 1) ? "Low" : (maxCaseComplexity === 2) ? "Medium" : "High"; 
  test.testName = maxTestName + 1;
  console.log("Test created: " + JSON.stringify(test));

  //Write to the DB


  Test.create(test)
  .then(() => {
    mongoose.connection.close();
  }); 

}
