const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const TestCase = require('../models/testCases');
const TestComponent = require('../models/testComponents');
const Test = require('../models/tests');

/*
const dbName = 'diagram-logic';
mongoose.connect(`mongodb://localhost/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

*/

//let selectedCats = [];
//let numOfComponents;



function createTestCases(comps, selectedCats, numOfComponents) {

  const testCase = {
    catOps: [],
    complexity: "",
    line1: { arg1: "", arg2: "", result: "" }, //hexadecimal strings of length 6
    line2: { arg1: "", arg2: "", result: "" },
    line3: { arg1: "", arg2: "", result: "" }
  };
  
  
  const numericTestCase = {
    line1: { arg1: 0, arg2: 0, result: 0 },
    line2: { arg1: 0, arg2: 0, result: 0 },
    line3: { arg1: 0, arg2: 0, result: 0 }
  };

  let numOfComponentsFromDB = comps.length;
  let selectedComps = [];

  console.log("Number of components: " + numOfComponentsFromDB);

  console.log("+++++++++++++++++++++++ selecteCats: " + selectedCats);

  for (let i = 0; i < selectedCats.length; i++) {
    let cat = selectedCats[i];
    let compsWithCategory = [];
    comps.reduce((acc, e) => {
      if (e.catName === cat) compsWithCategory.push(e);
    }, 0);
    console.log("Components with category: " + cat)
    console.log("Components with category " + cat + ": " + compsWithCategory.length);

    let n = Math.floor(Math.random() * compsWithCategory.length);
    selectedComps.push(compsWithCategory[n]);

  }

  //console.log("Selected Components: ", selectedComps);
  for (let c of selectedComps) console.log("Category: " + c.catName + " ID: " + c._id);

  //combine cases in one numericTestCase object

  numericTestCase.line1.arg1 = 0;
  numericTestCase.line1.arg2 = 0;
  numericTestCase.line1.result = 0;

  numericTestCase.line2.arg1 = 0;
  numericTestCase.line2.arg2 = 0;
  numericTestCase.line2.result = 0;

  numericTestCase.line3.arg1 = 0;
  numericTestCase.line3.arg2 = 0;
  numericTestCase.line3.result = 0;

  console.log(JSON.stringify(selectedComps));

  for (let c of selectedComps)
    addComponentToCase(c, numericTestCase);

  //populate the final testCase object
  for (let c of selectedComps) testCase.catOps.push({ catName: c.catName, opName: c.opName });
  testCase.complexity = (numOfComponents <= 2) ? "Low" : (numOfComponents <= 4) ? "Medium" : "High";

  //convert values to strings with .toString(16);
  testCase.line1.arg1 = numericTestCase.line1.arg1.toString(16);
  testCase.line1.arg2 = numericTestCase.line1.arg2.toString(16);
  testCase.line1.result = numericTestCase.line1.result.toString(16);

  testCase.line2.arg1 = numericTestCase.line2.arg1.toString(16);
  testCase.line2.arg2 = numericTestCase.line2.arg2.toString(16);
  testCase.line2.result = numericTestCase.line2.result.toString(16);

  testCase.line3.arg1 = numericTestCase.line3.arg1.toString(16);
  testCase.line3.arg2 = numericTestCase.line3.arg2.toString(16);
  testCase.line3.result = numericTestCase.line3.result.toString(16);

  console.log("For the database: ");
  console.log(JSON.stringify(testCase));

  //Write to the DB

  TestCase.create(testCase)
    .then(() => {
      // mongoose.connection.close();
      console.log('TestCase successfully created !!');
    });


}


function caseGenerator(numOfComponents) {
  console.log("*********************************************************************");
   //select categories
  
  const selectedCats = [];

  while (selectedCats.length < numOfComponents) {
    let n = Math.floor(Math.random() * categories.length);
    console.log('random number : ', n);
    let cat = categories[n].name;
    //validation
    if (selectedCats.includes(cat)
      || (cat === "D" && selectedCats.includes("E"))
      || (cat === "E" && selectedCats.includes("D"))) continue;
    selectedCats.push(cat);
  }

  console.log("Categories selected for this case: " + selectedCats);
  //Retrieve all components

  TestComponent.find()
    .then(docs => {
      //mongoose.connection.close();
     // console.log("RETURNED FROM FIND : ", docs);
      createTestCases(docs, selectedCats, numOfComponents);   //Promise inside!
    });
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/xadmin', (req, res) => {
  res.render('admin');
})

router.get('/components', (req, res) => {
  res.send('components generated ' + componentGenerator());
})

router.get('/cases/:noOfComp', (req, res) => {
  console.log("###### Request received " + req.params.noOfComp + "*****************");
  let numOfComponents = req.params.noOfComp;
  console.log('request for testcase received. Number of components ' + req.params.noOfComp);
  caseGenerator(numOfComponents);
  res.json('One case generated');
})

router.get('/tests/:numbOfCases/:complexity', (req, res) => {
  console.log("****************** Request received "+ req.params.numbOfCases +' '+ req.params.complexity + " *******");
  testGenerator(req.params.numbOfCases,req.params.complexity);
  res.json('One test generated');
})




//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TestComponentGenerator

const testComponent = {
  catName: "",
  opName: "",
  line1: { arg1: 0, arg2: 0, result: 0 },
  line2: { arg1: 0, arg2: 0, result: 0 },
  line3: { arg1: 0, arg2: 0, result: 0 }
};



const categories = [
  { name: "A", desc: "Line" },
  { name: "B", desc: "Arc" },
  { name: "C", desc: "Dot" },
  { name: "D", desc: "Centric" },
  { name: "E", desc: "Arrow" },
  { name: "F", desc: "Circle" }
];

const operations = [
  { name: "AND", desc: "Intersect of" },
  { name: "NAND", desc: "Negative intersect of" },
  { name: "OR", desc: "Union of" },
  { name: "NOR", desc: "Negative union of" },
  { name: "XOR", desc: "Exclusive union of" },
  //{name: "CW",   desc: "Clockwise rotation of"},
  //{name: "CCW",  desc: "Counter-clockwise rotation of"}
];

function componentGenerator() {


  let countComponents = 0;
  for (let cat of categories) {
    testComponent.catName = cat.name;
    ["A", "B", "C", "F"].includes(cat.name) ? genArgsUnrestricted() : genArgsRestricted();
    //pre-calculate results of each operation (line 3 only)
    let res = [];
    for (let op of operations)
      res.push(bitwise(op.name, testComponent.line3.arg1, testComponent.line3.arg2));
    //console.log("Results: " + res);
    //validate (invalid cases will be replaced with -1)
    let validRes = validate(cat.name, res);
    //console.log("Validated: " + validRes);
    validRes.forEach((e, i, a) => {
      if (e < 0) return;
      else {
        testComponent.opName = operations[i].name;
        console.log("Generating component for category " + testComponent.catName
          + " and operation " + testComponent.opName);
        countComponents = countComponents + 1;
        testComponent.line1.result
          = bitwise(testComponent.opName, testComponent.line1.arg1, testComponent.line1.arg2);
        testComponent.line2.result
          = bitwise(testComponent.opName, testComponent.line2.arg1, testComponent.line2.arg2);
        testComponent.line3.result
          = bitwise(testComponent.opName, testComponent.line3.arg1, testComponent.line3.arg2);
        //console.log(testComponent);           

        //Convert numbers to hex with num.toString(16)
        //convertToHex(testComponent);

        //Write to the DB

        TestComponent.create(testComponent, (err) => {
          if (err) { throw (err) }
          //console.log(`Created ${testcases.length} testcases`)<
        });

      }
    });

  }  //end of category processing
  console.log("Generated: " + countComponents + " components");
  return countComponents;
} // end of componentGenerator function


//Functions

function validate(catname, opResults) {
  let uniqueRes = opResults.map((e, i, a) => {
    return (a.indexOf(e) === a.lastIndexOf(e)) ? e : -1;
  });
  let valid = uniqueRes.map((e, i, a) => {
    return (["NAND", "NOR"].includes(operations[i].name) && ["D", "E"].includes(catname)) ? -1 : e;
  });
  return valid;
}


function bitwise(op, arg1, arg2) {
  switch (op) {
    case "AND": return arg1 & arg2;
    case "NAND": return (~(arg1 & arg2)) & 15;
    case "OR": return arg1 | arg2;
    case "NOR": return (~(arg1 | arg2)) & 15;
    case "XOR": return arg1 ^ arg2;
    default: return 0;
  }

}

function genArgsUnrestricted() {
  testComponent.line1.arg1 = Math.floor((Math.random() * 16));
  testComponent.line1.arg2 = Math.floor((Math.random() * 16));
  testComponent.line2.arg1 = Math.floor((Math.random() * 16));
  testComponent.line2.arg2 = Math.floor((Math.random() * 16));
  testComponent.line3.arg1 = Math.floor((Math.random() * 16));
  testComponent.line3.arg2 = Math.floor((Math.random() * 16));
}

function genArgsRestricted() {
  const allowed = [8, 4, 2, 1];
  const i = Math.floor((Math.random() * 4));
  const arg = allowed[i];
  testComponent.line1.arg1 = arg * Math.floor((Math.random() * 2));
  testComponent.line1.arg2 = arg * Math.floor((Math.random() * 2));
  testComponent.line2.arg1 = arg * Math.floor((Math.random() * 2));
  testComponent.line2.arg2 = arg * Math.floor((Math.random() * 2));
  testComponent.line3.arg1 = arg * Math.floor((Math.random() * 2));
  testComponent.line3.arg2 = arg * Math.floor((Math.random() * 2));
}


/*
//remove
function convertToHex(comp) {
  comp.line1.arg1 = comp.line1.arg1.toString(16);
  comp.line1.arg2 = comp.line1.arg2.toString(16);
  comp.line1.result = comp.line1.result.toString(16);
  comp.line2.arg1 = comp.line2.arg1.toString(16);
  comp.line2.arg2 = comp.line2.arg2.toString(16);
  comp.line2.result = comp.line2.result.toString(16);
  comp.line3.arg1 = comp.line3.arg1.toString(16);
  comp.line3.arg2 = comp.line3.arg2.toString(16);
  comp.line3.result = comp.line3.result.toString(16);

}
*/
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< CaseGenerator >>>>>>>>>>>>>>>>>>>>>>>>>>>>><




// end of the CaseGenerator function


function addComponentToCase(tcomp, tcase) {

  const catNames = ["A", "B", "C", "D", "E", "F"];
  const catWeights = [16 ** 5, 16 ** 4, 16 ** 3, 16 ** 2, 16, 1];
  const idx = catNames.indexOf(tcomp.catName);
  let weight = catWeights[idx];

  console.log("Category: " + tcomp.catName + " WEIGHT: " + weight);

  //operations on numbers
  tcase.line1.arg1 = tcase.line1.arg1 + tcomp.line1.arg1 * weight;
  tcase.line1.arg2 = tcase.line1.arg2 + tcomp.line1.arg2 * weight;
  tcase.line1.result = tcase.line1.result + tcomp.line1.result * weight;

  tcase.line2.arg1 = tcase.line2.arg1 + tcomp.line2.arg1 * weight;
  tcase.line2.arg2 = tcase.line2.arg2 + tcomp.line2.arg2 * weight;
  tcase.line2.result = tcase.line2.result + tcomp.line2.result * weight;

  tcase.line3.arg1 = tcase.line3.arg1 + tcomp.line3.arg1 * weight;
  tcase.line3.arg2 = tcase.line3.arg2 + tcomp.line3.arg2 * weight;
  tcase.line3.result = tcase.line3.result + tcomp.line3.result * weight;

}


//>>>>>>>>>>>>>>>>>>>> Test Generator >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function testGenerator (numOfCases, maxCaseComplexity) {

  let maxTestName = 0;

  Test 
  .findOne({})
  .sort('-testName')   //getting max
  .exec(function (err, testMax) {
    maxTestName = (testMax === null) ? 0 : testMax.testName;
    
    //Get all test cases from DB
    TestCase.find()
    .then (docs => {

      //Generate one test 
      createTest(docs, numOfCases, maxCaseComplexity, maxTestName); //Promise inside!

    });
  });   
}

function createTest(cases, numOfCases, maxCaseComplexity, maxTestName) {

  console.log(">>>>>>>>>>>>>Number of cases in DB: " + cases.length);  

  let test = {   
    testName: maxTestName + 1,    
    complexity: (parseInt(maxCaseComplexity) === 1) ? "Low" :((parseInt(maxCaseComplexity) === 2)
           ? "Medium" : "High"),
    cases: []
  };

  while (test.cases.length < numOfCases) {
    const n = Math.floor(Math.random() * cases.length);
    let caseId = cases[n]._id;
    let cx = cases[n].complexity;
    //validation
    if (test.cases.includes(caseId) 
        || (maxCaseComplexity === 1 && cx !== "Low")
        || (maxCaseComplexity === 2 && cx === "High")) 
        continue;
    test.cases.push(caseId);
  }
 
    //Write it to the DB
    Test.create(test)     //Promise inside!
    .then(() => {
      console.log(">>>>>>>>>>>> Test created: " + JSON.stringify(test));
      //mongoose.connection.close();
    });  
}


module.exports = router;