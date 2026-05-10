import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-slate-900 border-b-4 border-yellow-400 inline-block pb-1">About Us</h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="md:col-span-1 text-center"
            >
              <img 
                src="/folder/principal.jpg" 
                alt="Dr. R. Abhishek" 
                className="w-full rounded-lg shadow-lg mb-6 object-cover"
              />
              <h3 className="text-xl font-bold text-slate-900">Dr. R. Abhishek</h3>
              <p className="text-slate-600 text-sm mt-1">Director (B.H.M.S., MD(Eh), MBA, B.Ed)</p>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               className="md:col-span-2 space-y-10 mt-4 md:mt-0"
            >
              <div>
                <h2 className="text-2xl font-bold mb-3 text-slate-900">Principal’s Message</h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                  Welcome to H.N.P. Institute Of Education. We combine academic excellence with value-based learning,
                  ensuring that every child grows in a safe, secure, and child-friendly environment. Our approach focuses
                  on individual attention, English communication, and skill-building.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-3 text-slate-900">Our History</h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                  Run by the <strong className="text-slate-900">Mira Educational & Welfare Trust</strong>, H.N.P. Institute of Education was established with a
                  commitment to providing quality education in Motihari. We are an ISO 9001:2015 Certified Institution
                  dedicated to nurturing young minds from Play Group to Class V.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-[#0b2b53] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
              <ul className="space-y-3 text-lg text-blue-50">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-300">•</span>
                  Offer quality education with modern teaching methods.
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-300">•</span>
                  Create a safe, disciplined, and inspiring environment.
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-300">•</span>
                  Encourage creativity, leadership, and critical thinking.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Accreditation</h2>
              <p className="text-lg text-blue-50 leading-relaxed">
                We are proud to be ISO 9001:2015 Certified, ensuring international standards of quality management in our educational processes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
