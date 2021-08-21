const connectDb = require("../config/connection");
const inquirer = require('inquirer');

const departmentTable = function () {
    const sql = "SELECT * FROM department";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         return console.table(result);
         //startPrompts();
     }
    });
}

async function addDepartmentByName (departmentName){

    const param = departmentName;
    const sql = `INSERT INTO department (department_name) VALUES (?)`

    connectDb.query(sql, param, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.log("\x1b[33m", `\n------  ${param} has been added to the department table ------\n`);
            departmentTable();
        }
    })
}

module.exports = {
    addDepartmentByName,
    departmentTable
}