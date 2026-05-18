import { Users, Target, Shield, CheckCircle, Compass, Award, Sparkles, User } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white">
      <SEO 
        title="About Our Journey" 
        description="Learn more about Sipalaya Info Tech, our mission to bridge the skill gap in Nepal, and our commitment to excellence in IT education."
        url="/about"
      />
      {/* Hero Section */}
      <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Sipalaya IT Training</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Empowering individuals and organizations with cutting-edge tech skills to thrive in the digital economy.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">Our Purpose</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-6 tracking-tight">Our Mission & Vision</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                At Sipalaya Info Tech, we believe in empowering raw potential and turning it into world-class digital expertise. We don't just teach code; we shape careers and nurture the innovators of tomorrow.
              </p>
              <div className="space-y-8">
                {/* Mission Block */}
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
                      <Target size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">
                      To bridge the gap between academic learning and industry requirements by providing high-quality, practical, and affordable IT training to students and professionals.
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Real-World Projects</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Industry-Ready Curricula</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Empowering Careers</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Accessible Excellence</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vision Block */}
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                      <Shield size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">
                      To be the leading IT training institution in Nepal, recognized globally for producing top-tier tech talent capable of solving complex real-world problems.
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Global Tech Hub</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Lifelong Learning Network</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Digital Transformation</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={18} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Pioneering Pedagogy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Elements */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Training" className="rounded-2xl w-full h-64 object-cover shadow-lg transform hover:scale-102 transition-transform duration-300" />
                  <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg border border-indigo-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <div className="text-3xl font-extrabold mb-1">100%</div>
                    <div className="text-sm text-indigo-100 font-semibold uppercase tracking-wider">Practical Focus</div>
                    <p className="text-xs text-indigo-200 mt-2">Our training is purely job-oriented, centered around real industrial coding paradigms.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 opacity-20 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <div className="text-3xl font-extrabold mb-1">5K+</div>
                    <div className="text-sm text-indigo-300 font-semibold uppercase tracking-wider">Success Stories</div>
                    <p className="text-xs text-slate-400 mt-2">Empowered thousands of professionals and students to step up their careers.</p>
                  </div>
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Students" className="rounded-2xl w-full h-64 object-cover shadow-lg transform hover:scale-102 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">Core Beliefs</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">The Values That Drive Us</h2>
            <p className="mt-4 text-lg text-slate-600">
              Our culture is built upon a foundation of commitment, standard of excellence, and student empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6 text-amber-600" />,
                bg: 'bg-amber-50 border-amber-100',
                title: 'Student Success First',
                desc: 'Our ultimate metric of success is the growth, confidence, and career outcomes of our learners.'
              },
              {
                icon: <Compass className="w-6 h-6 text-emerald-600" />,
                bg: 'bg-emerald-50 border-emerald-100',
                title: 'Continuous Adaptation',
                desc: 'The tech landscape changes daily; we continuously evolve our courses and methods to stay ahead of the curve.'
              },
              {
                icon: <Award className="w-6 h-6 text-indigo-600" />,
                bg: 'bg-indigo-50 border-indigo-100',
                title: 'Integrity & Excellence',
                desc: 'We are committed to transparency, high educational standards, and robust, lifelong mentorship.'
              },
              {
                icon: <Users className="w-6 h-6 text-blue-600" />,
                bg: 'bg-blue-50 border-blue-100',
                title: 'Collaboration & Growth',
                desc: 'Building a supportive ecosystem where alumni, instructors, and students collaborate on real-world projects.'
              }
            ].map((value, idx) => (
              <div key={idx} className={`p-8 rounded-2xl border ${value.bg} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History & Growth */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Our Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { year: '2015', title: 'Foundation', desc: 'Started with 2 instructors and a single classroom.' },
              { year: '2018', title: 'Expansion', desc: 'Introduced advanced courses and corporate training.' },
              { year: '2021', title: 'Online Transition', desc: 'Launched full-scale online learning platforms.' },
              { year: '2024', title: 'Global Reach', desc: 'Partnered with international tech companies.' },
            ].map((milestone, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-3xl font-extrabold text-indigo-600 mb-2">{milestone.year}</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{milestone.title}</h4>
                <p className="text-slate-600 text-sm">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">Meet Sipalaya</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight">Our Team</h2>
            <p className="text-lg text-slate-600">Meet the dedicated professionals driving Sipalaya Info Tech's educational and technology excellence.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Er. Himal Rawal',
                role: 'CEO',
                desc: 'Visionary leader driving IT training, recruitment, and software development, committed to empowering individuals with job-ready skills and real-world opportunities.',
                img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Er. Sujan Thadarai',
                role: 'IT Manager',
                desc: 'Experienced IT Manager and Django Developer specializing in building scalable web applications, managing technical teams, and delivering efficient, real-world software solutions.',
                img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Pramod Mahto',
                role: 'Senior MERN Developer & Instructor',
                desc: 'Skilled MERN Developer and Instructor with expertise in building modern web applications and mentoring students to become job-ready through practical, hands-on training.',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Saroj Giri',
                role: 'Data Science Developer & Instructor',
                desc: 'Saroj Giri is a Data Science Developer & Instructor with expertise in Python, machine learning, and data analytics. He is passionate about mentoring students to build job-ready skills through real-world projects.',
                img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Ramesh Bista',
                role: 'Student Support Coordinator',
                desc: 'Ensures smooth student experience by handling queries, coordinating classes, and providing continuous academic and administrative support.',
                img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Rajan Shrestha',
                role: 'MERN Developer',
                desc: 'Skilled in building full-stack web applications using MongoDB, Express.js, React.js, and Node.js, delivering responsive and efficient solutions.',
                img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Sangam Swornakar',
                role: 'Graphic Designer',
                desc: 'Creative Graphic Designer specializing in visual storytelling, branding, and digital design to craft engaging visuals.',
                img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Biplove Paudel',
                role: 'Business Development Executive',
                desc: 'Drives company growth by identifying opportunities, building client relationships, and boosting sales and partnerships.',
                img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Saurab Karki',
                role: 'Python Developer',
                desc: 'Proficient Python Developer focused on writing clean, efficient code and building scalable applications and data-driven solutions.',
                img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Ajay Dhoju',
                role: 'Digital Marketing Executive',
                desc: 'Manages online campaigns, social media, and SEO strategies to boost brand visibility and drive customer engagement.',
                img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Kirtan Shrestha',
                role: 'UI / UX Designer',
                desc: 'Designs intuitive and engaging user interfaces, focusing on seamless user experience and visual appeal across digital platforms.',
                img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              }
            ].map((member, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-5 overflow-hidden rounded-full border-4 border-indigo-50 bg-indigo-50/50 flex items-center justify-center text-indigo-400 shadow-inner">
                  <User size={48} className="stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
                  {member.role}
                </span>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Ready to Build Your Tech Career?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join Sipalaya IT Training today and take the first step towards a successful career in the IT industry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/courses" className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-lg shadow-indigo-900/20">
              Browse Courses
            </Link>
            <Link to="/contact" className="px-8 py-3.5 bg-transparent border border-indigo-200 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
