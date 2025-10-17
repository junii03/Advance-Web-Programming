import firebase from "../assets/icons/firebase.svg";
import flutter from '../assets/icons/flutter.svg'
import node from "../assets/icons/nodejs-icon-logo-svgrepo-com.svg";
import react from "../assets/icons/react-svgrepo-com.svg";
import tailwind from '../assets/icons/tailwind-svgrepo-com.svg'
import mongo from '../assets/icons/mongo-svgrepo-com.svg'
const About = () => {
    return (
        <section className="flex flex-col items-center justify-center  px-4" id="about">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight font-heading">About Me</h2>
                <p className="mt-2 text-lg text-gray-400 font-display">A glimpse into my journey and skills.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mt-12">
                <div className=" glassmorphic rounded-xl shadow-lg p-6 sm:p-10 flex-2  text-left  self-center ">
                    <p className="font-medium">I am a software engineering student and developer specializing in Flutter, Dart, and modern web technologies. I build high-performance cross-platform apps with Flutter, ensuring a seamless experience across iOS, Android, and Web.
                    </p>
                    <p className="mt-4 font-medium">
                        Strong backend foundations ensure your app scales. I design APIs and backend systems that are secure, fast, and easy to integrate with mobile clients.
                    </p>

                    <p className="mt-4 font-medium">
                        Beyond mobile, I also build scalable web apps using modern frameworks like React, Next.js, and TailwindCSS — combining speed, security, and clean design.

                    </p>
                </div>

                <div className="glassmorphic rounded-xl shadow-lg p-6 sm:p-10 flex-1">
                    <h3 className="text-xl font-bold mb-4 font-display text-left">Core Technologies</h3>
                    <div className="grid grid-cols-2 gap-5 mt-10">
                        <div className="flex items-center gap-3">
                            <img src={flutter} alt="Flutter Logo" className="w-5 h-5" />
                            <span>Flutter</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={firebase} alt="Firebase Logo" className="w-5 h-5" />
                            <span>Firebase</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={node} alt="Node Logo" className="w-5 h-5" />
                            <span>NodeJS</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={react} alt="React Logo" className="w-5 h-5" />
                            <span>React</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={tailwind} alt="Tailwind Logo" className="w-5 h-5" />
                            <span>TailwindCSS</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={mongo} alt="MongoDB Logo" className="w-5 h-5" />
                            <span>MongoDB</span>
                        </div>

                    </div>
                </div>
            </div>

        </section>
    )
}

export default About
