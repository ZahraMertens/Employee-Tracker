const express = require('express');
require("dotenv").config();
const fs = require('fs');
const mysql = require('mysql2');
const inquirer = require('inquirer');
// const { inherits } = require('util');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connectDb = mysql.createConnection(
    {
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE
   },
   console.log(`Connected to the employees_db database.`)
);



function startPrompts(){
        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "viewOptions",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role"
                ]
            }
        ])
        .then(function(data){
            const selectedOpt = data.viewOptions;
            switch(selectedOpt){
                case "View all departments":
                    if (selectedOpt === "View all departments"){
                        return viewDepartment();
                    }
                case "View all roles":
                    if (selectedOpt === "View all roles"){
                        return viewRoles();
                    }
                case "View all employees":
                    if (selectedOpt === "View all employees"){
                        return viewEmployees();
                    }
                case "Add a department":
                    if (selectedOpt === "Add a department"){
                        return addDepartment();
                    }
                case "Add a role":
                    if (selectedOpt === "Add a role"){
                        return addRole();
                    }
                case "Add an employee":
                    if (selectedOpt === "Add an employee"){
                        return addEmployee();
                    }
                case "Update an employee role":
                    if (selectedOpt === "Update an employee role"){
                        return updateRole();
                    }
            }
        })
}

const viewDepartment = function () {
    const sql = "SELECT * FROM department";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

const viewRoles = function () {
    const sql = "SELECT * FROM role";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

const viewEmployees = function () {
    const sql = "SELECT * FROM employee";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

const addDepartment = function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the name of the department?",
            name: "addDepartment",
        }
    ])
    .then(function(data){
        console.log(data.addDepartment)
        const departmentInput = data.addDepartment;
        const sql = `INSERT INTO department (department_name) VALUES (?)`

        connectDb.query(sql, departmentInput, (err, result) => {
            if (err) {
                console.error(err)
            } else {
                console.log("\x1b[33m", `\n------  Database has been updated! ------\n`);
                viewDepartment();
            }
           });

    })
}

const addRole = function () {}

const addEmployee = function () {}

const updateRole = function () {}

const init = async () => {
    await console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n");
    startPrompts();
}

init();
