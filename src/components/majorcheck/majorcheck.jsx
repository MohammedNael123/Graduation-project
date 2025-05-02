import { useState } from 'react';
import { motion } from 'framer-motion';
import { BeatLoader } from 'react-spinners';

const MajorCheck = () => {
  const [step, setStep] = useState(1);
  const [major, setMajor] = useState('');
  const [language, setLanguage] = useState('en');
  const [definition, setDefinition] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDefinition = async () => {
    if (!major.trim()) {
      setError(language === 'ar' ? 'الرجاء إدخال تخصص' : 'Please enter a major');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/major-definition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ major, language })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch definition');
      }

      setDefinition(data.majorDefinition);
      setStep(2);
    } catch (err) {
      setError(err.message || (language === 'ar' ? 'خطأ في جلب البيانات' : 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  const generateTest = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ major, language })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate test');
      }

      setTest(data.test);
      setStep(3);
    } catch (err) {
      setError(err.message || (language === 'ar' ? 'خطأ في إنشاء الاختبار' : 'Test generation failed'));
    } finally {
      setLoading(false);
    }
  };

  const submitTest = () => {
    if (answers.length < test.questions.length) {
      setError(language === 'ar' ? 'الرجاء الإجابة على جميع الأسئلة' : 'Please answer all questions');
      return;
    }

    // Calculate score and generate recommendation
    const score = test.questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    const recommendationData = {
      score,
      total: test.questions.length,
      recommendation: score >= 3 ? 
        (language === 'ar' ? 'ممتاز! هذا التخصص يناسبك بشكل جيد' : 'Excellent! This major seems well-suited for you') :
        (language === 'ar' ? 'قد ترغب في استكشاف تخصصات ذات صلة' : 'You might want to explore related majors'),
      improvementTips: [
        language === 'ar' ? 'تعمق في المفاهيم الأساسية' : 'Strengthen core concepts',
        language === 'ar' ? 'طور مهاراتك العملية' : 'Develop practical skills',
        language === 'ar' ? 'شارك في مشاريع تخصصية' : 'Engage in specialized projects'
      ],
      alternativeMajors: definition?.relatedMajors || []
    };

    setRecommendation(recommendationData);
    setStep(4);
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
          >
            <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {language === 'ar' ? 'اكتشاف التخصص الجامعي' : 'University Major Explorer'}
            </h1>
            <div className="space-y-6">
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل التخصص...' : 'Enter your major...'}
                className="w-full px-6 py-4 border-2 border-indigo-200 rounded-xl text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={getDefinition}
                disabled={!major || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
                  hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <BeatLoader size={12} color="#fff" />
                ) : language === 'ar' ? 'استمرار' : 'Continue'}
              </motion.button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {language === 'ar' ? 'تعريف التخصص' : 'Major Overview'}
            </h2>
            
            {loading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <BeatLoader size={15} color="#3B82F6" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-indigo-50/50 p-6 rounded-xl border-l-4 border-indigo-500">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-indigo-500 text-2xl">📖</span>
                    <h3 className="text-xl font-semibold text-indigo-800">
                      {language === 'ar' ? 'نبذة تعريفية' : 'Major Overview'}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg bg-white p-4 rounded-lg shadow-sm">
                    {definition?.definition}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <DetailCard 
                    title={language === 'ar' ? 'المهارات المطلوبة' : 'Required Skills'}
                    items={definition?.skills}
                    icon="📚"
                    color="indigo"
                  />
                  <DetailCard
                    title={language === 'ar' ? 'الفرص الوظيفية' : 'Career Opportunities'}
                    items={definition?.careers}
                    icon="💼"
                    color="blue"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateTest}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 px-8 rounded-xl 
                    hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg text-lg"
                >
                  {language === 'ar' ? 'ابدأ الاختبار' : 'Start Assessment'}
                </motion.button>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {language === 'ar' ? 'اختبار الملائمة' : 'Suitability Assessment'}
            </h2>
            
            <div className="space-y-8">
              {test?.questions?.map((question, qIndex) => (
                <motion.div 
                  key={qIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-indigo-50/50 p-6 rounded-xl"
                >
                  <p className="text-lg font-semibold mb-4 text-gray-700">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((option, oIndex) => (
                      <motion.button
                        key={oIndex}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(qIndex, oIndex)}
                        className={`p-4 text-left rounded-lg transition-all ${
                          answers[qIndex] === oIndex
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-indigo-50'
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitTest}
                disabled={answers.length < test?.questions?.length || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
                  hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <BeatLoader size={12} color="#fff" />
                ) : language === 'ar' ? 'تقديم النتائج' : 'Submit Assessment'}
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {language === 'ar' ? 'النتائج والتوصيات' : 'Results & Recommendations'}
            </h2>
            
            <div className="space-y-8">
              <div className="bg-emerald-50/50 p-6 rounded-xl border-l-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-emerald-500 text-2xl">📊</span>
                  <h3 className="text-xl font-semibold text-emerald-800">
                    {language === 'ar' ? 'النتائج' : 'Your Score'}
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-gray-700">
                    {recommendation.score}/{recommendation.total}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {recommendation.recommendation}
                  </p>
                </div>
              </div>

              <DetailCard
                title={language === 'ar' ? 'نصائح تحسين' : 'Improvement Tips'}
                items={recommendation.improvementTips}
                icon="🚀"
                color="blue"
              />

              <DetailCard
                title={language === 'ar' ? 'تخصصات بديلة' : 'Alternative Majors'}
                items={recommendation.alternativeMajors}
                icon="🎯"
                color="purple"
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="fixed top-4 right-4 bg-white/80 backdrop-blur-lg rounded-full shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-6 py-2 rounded-full hover:bg-gray-50 transition-colors"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl mb-8 bg-red-100 text-red-700 p-4 rounded-xl border border-red-200 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="w-full flex items-center justify-center">
        {renderStep()}
      </div>
    </div>
  );
};

const DetailCard = ({ title, items, icon, color }) => {
  const colorClasses = {
    indigo: { bg: 'bg-indigo-50/50', border: 'border-indigo-500', text: 'text-indigo-800' },
    blue: { bg: 'bg-blue-50/50', border: 'border-blue-500', text: 'text-blue-800' },
    purple: { bg: 'bg-purple-50/50', border: 'border-purple-500', text: 'text-purple-800' }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${colorClasses[color].bg} p-6 rounded-xl border-l-4 ${colorClasses[color].border}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`${colorClasses[color].text} text-2xl`}>{icon}</span>
        <h3 className={`text-xl font-semibold ${colorClasses[color].text}`}>{title}</h3>
      </div>
      <ul className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
        {items?.map((item, index) => (
          <motion.li 
            key={index}
            whileHover={{ x: 5 }}
            className="flex items-start text-gray-600 hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <span className={`${colorClasses[color].text} mr-2`}>▹</span>
            <span className="flex-1">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default MajorCheck;