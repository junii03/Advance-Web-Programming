const salaries = [1000, 2000, 3000, 4000, 5000];

const updatedSalaries = salaries.map(salary => salary * 1.1);

console.log(updatedSalaries);

const highSalaries = updatedSalaries.filter(salary => salary > 3000);

console.log(highSalaries);

const totalSalary = highSalaries.reduce((total, salary) => total + salary, 0);

console.log(totalSalary);

// rest and spread operators
const person = {
    name: 'John',
    age: 30,
    city: 'New York'
};



const newPerson = {
    ...person,
    country: 'USA'
};

console.log(newPerson);

const { age, ...personWithoutAge } = person;

console.log(personWithoutAge);

// destructuring
const numbers = [1, 2, 3, 4, 5];

const [first, second, ...rest] = numbers;

console.log(first);
console.log(second);
console.log(rest);
