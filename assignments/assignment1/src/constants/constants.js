import portfolio from "../assets/projects/Screenshot 2025-10-18 at 1.46.26 AM.png";
import firebase from "../assets/icons/firebase.svg";
import flutter from '../assets/icons/flutter.svg'
import seafarer from "../assets/projects/connecting-seafarer.jpeg";
import zakis from "../assets/projects/Screenshot 2025-10-18 at 2.11.42 AM.png";
import react from "../assets/icons/react-svgrepo-com.svg";
import tailwind from '../assets/icons/tailwind-svgrepo-com.svg'
import node from "../assets/icons/nodejs-icon-logo-svgrepo-com.svg";
import mongo from '../assets/icons/mongo-svgrepo-com.svg'
const projects = [
    {
        title: "Portfolio App",
        description: "My Personal Portfolio showcasing my work.",
        image: portfolio,
        alt: "Screenshot of a Portfolio app showing my work.",
        techStack: [
            { src: react, alt: "React Logo" },
            { src: tailwind, alt: "Tailwind Logo" }
        ],
        link: "https://junaidafzal.dev/"
    },
    {
        title: "E-Commerce App",
        description: "An E-Commerce app for buying and selling scents.",
        image: zakis,
        alt: "Screenshot of an E-Commerce app for buying and selling scents.",
        techStack: [
            { src: firebase, alt: "Firebase Logo" },
            { src: react, alt: "React Logo" }
        ],
        link: "https://zakisessence.pk/"
    },
    {
        title: "Social Media Platform",
        description: "A Social Media app for Seafarers",
        image: seafarer,
        alt: "Screenshot of a Social Media app for Seafarers",
        techStack: [
            { src: flutter, alt: "React Native Logo" },
            { src: firebase, alt: "Firebase Logo" }
        ],
        link: "https://play.google.com/store/apps/details?id=com.marinoft.connecting_seafarer"
    }

]

const skills = [
    { src: flutter, alt: "Flutter Logo", name: "Flutter" },
    { src: firebase, alt: "Firebase Logo", name: "Firebase" },
    { src: react, alt: "React Logo", name: "React" },
    { src: tailwind, alt: "Tailwind Logo", name: "Tailwind" },
    { src: node, alt: "NodeJS Logo", name: "NodeJS" },
    { src: mongo, alt: "MongoDB Logo", name: "MongoDB" },
]

export { projects, skills };
