import React, { useState } from 'react';

const RadarChart = ({ data }) => {
  const size = 280;
  const center = size / 2;
  const maxRadius = center - 30;
  const levels = 5;
  
  const angleStep = (2 * Math.PI) / data.length;
  const angles = data.map((_, index) => -Math.PI / 2 + index * angleStep);
  
  const levelCircles = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius * (i + 1)) / levels;
    return React.createElement('circle', {
      key: i,
      cx: center,
      cy: center,
      r: radius,
      fill: 'none',
      stroke: '#e5e7eb',
      strokeWidth: '1'
    });
  });
  
  const axisLines = data.map((item, index) => {
    const angle = angles[index];
    const x = center + maxRadius * Math.cos(angle);
    const y = center + maxRadius * Math.sin(angle);
    
    const labelX = center + (maxRadius + 25) * Math.cos(angle);
    const labelY = center + (maxRadius + 25) * Math.sin(angle);
    
    return React.createElement('g', { key: index },
      React.createElement('line', {
        x1: center,
        y1: center,
        x2: x,
        y2: y,
        stroke: '#d1d5db',
        strokeWidth: '1'
      }),
      React.createElement('text', {
        x: labelX,
        y: labelY,
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        className: 'text-xs font-medium fill-gray-600'
      }, item.name.replace(' ', '\n'))
    );
  });
  
  const dataPoints = data.map((item, index) => {
    const angle = angles[index];
    const value = item.score / item.maxScore;
    const radius = maxRadius * value;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });
  
  const pathData = dataPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="border rounded-lg bg-white">
        {levelCircles}
        {axisLines}
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
          />
        ))}
      </svg>
    </div>
  );
};

const ConsciousnessAssessment = () => {
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);

  const dimensions = [
    {
      name: "Mental Resilience",
      description: "Your capacity to maintain clarity of thought under pressure",
      questions: [
        "When I encounter information that strongly contradicts my beliefs, I pause to consider it thoughtfully rather than immediately dismissing it.",
        "I can distinguish between my emotional reactions and my actual thoughts - I notice when I'm being reactive vs. analytical.",
        "When faced with complex problems, I can hold multiple perspectives simultaneously without needing to immediately choose sides.",
        "I regularly question my own assumptions and ask 'What if I'm wrong about this?'",
        "Under stress or information overload, I can still access calm, clear thinking rather than becoming overwhelmed."
      ]
    },
    {
      name: "Informational Sovereignty",
      description: "Your ability to consciously choose what influences enter your mind",
      questions: [
        "I actively choose my information sources rather than passively consuming whatever algorithms show me.",
        "I can tell when content is designed to trigger an emotional reaction rather than inform me.",
        "I regularly seek out perspectives that challenge my existing viewpoints to get a more complete picture.",
        "I have specific times when I'm completely disconnected from digital information feeds.",
        "I notice when I'm mindlessly scrolling or consuming content and can stop myself."
      ]
    },
    {
      name: "Real Community",
      description: "Your network of genuine relationships independent of digital platforms",
      questions: [
        "I have people in my life who know me well enough to call out my blind spots or bad decisions.",
        "I regularly engage in face-to-face conversations about meaningful topics, not just small talk.",
        "If social media disappeared tomorrow, I would still have strong connections with people who matter to me.",
        "I participate in local activities or groups that bring me into contact with diverse perspectives.",
        "When I need support or advice, I turn to real people rather than online forums or AI."
      ]
    },
    {
      name: "Active Creation",
      description: "Your capacity to influence and build rather than just consume",
      questions: [
        "I regularly create something new (art, writing, solutions, projects) rather than only consuming content.",
        "I contribute my own perspectives to important conversations rather than just observing or sharing others' content.",
        "When I see problems in my community or field, I take action to help solve them rather than just complaining.",
        "I feel confident in my ability to make things happen and influence outcomes in areas I care about.",
        "I spend more time building and creating than I do consuming entertainment or information."
      ]
    },
    {
      name: "Natural Connection",
      description: "Your link to rhythms and systems that existed before technology",
      questions: [
        "I spend regular time in nature without devices, paying attention to natural rhythms and cycles.",
        "I have practical skills that don't depend on technology (cooking, gardening, fixing things, etc.).",
        "I notice and align with natural rhythms like seasons, daylight cycles, and my body's energy patterns.",
        "I can be comfortable with boredom or silence without immediately reaching for a device.",
        "I have hobbies or activities that engage my hands and body, not just my mind."
      ]
    },
    {
      name: "Solid Character",
      description: "Your core identity that remains stable while everything changes",
      questions: [
        "I have clear, conscious values that guide my decisions even when it's difficult or unpopular.",
        "I act consistently with my stated beliefs rather than just talking about them.",
        "I can maintain my principles even when facing social pressure or potential consequences.",
        "I regularly reflect on who I'm becoming and whether my actions align with who I want to be.",
        "People who know me well would say I'm the same person in private as I am in public."
      ]
    }
  ];

  const handleResponse = (dimensionIndex, questionIndex, value) => {
    const key = `${dimensionIndex}-${questionIndex}`;
    setResponses({
      ...responses,
      [key]: parseInt(value)
    });
  };

  const calculateScores = () => {
    const dimensionScores = dimensions.map((dimension, dimIndex) => {
      let total = 0;
      for (let qIndex = 0; qIndex < dimension.questions.length; qIndex++) {
        const key = `${dimIndex}-${qIndex}`;
        total += responses[key] || 0;
      }
      return { name: dimension.name, score: total, maxScore: dimension.questions.length * 5 };
    });

    const totalScore = dimensionScores.reduce((sum, dim) => sum + dim.score, 0);
    return { dimensionScores, totalScore };
  };

  const getReadinessLevel = (score) => {
    if (score >= 120) return { level: "Conscious Navigator", color: "text-green-600", description: "You're well-prepared for conscious evolution. Focus on maintaining and deepening your strongest areas while supporting others on their journey." };
    if (score >= 90) return { level: "Developing Awareness", color: "text-blue-600", description: "You have good foundations with room for growth. Identify your 1-2 weakest areas and focus development there." };
    if (score >= 60) return { level: "Awakening Phase", color: "text-yellow-600", description: "You're beginning to recognize the importance of conscious development. Choose your lowest-scoring dimension and start there." };
    if (score >= 30) return { level: "Early Recognition", color: "text-orange-600", description: "You're at the beginning of the journey. This is perfect - awareness is the first step. Start with small, consistent practices." };
    return { level: "Invitation to Begin", color: "text-purple-600", description: "No judgment - everyone starts somewhere. The fact that you took this assessment shows readiness. Pick one area that resonates and take one small step." };
  };

  const getWeakestArea = (dimensionScores) => {
    return dimensionScores.reduce((weakest, current) => 
      current.score < weakest.score ? current : weakest
    );
  };

  const getSWOTAnalysis = (dimensionScores) => {
    const sortedDimensions = [...dimensionScores].sort((a, b) => b.score - a.score);
    const strengths = sortedDimensions.slice(0, 2);
    const weaknesses = sortedDimensions.slice(-2);
    
    const opportunities = {
      "Mental Resilience": "Develop meditation practice to enhance clarity under pressure",
      "Informational Sovereignty": "Create curated information diet to expand perspective",
      "Real Community": "Build local networks that provide diverse viewpoints and support",
      "Active Creation": "Start projects that combine your skills with meaningful impact",
      "Natural Connection": "Integrate nature practices to ground your technological life",
      "Solid Character": "Align daily actions more closely with core values"
    };
    
    const threats = {
      "Mental Resilience": "Risk of being overwhelmed by information and making reactive decisions",
      "Informational Sovereignty": "Susceptible to algorithmic manipulation and echo chambers",
      "Real Community": "Isolation may lead to losing touch with diverse perspectives",
      "Active Creation": "Passive consumption may erode sense of personal agency",
      "Natural Connection": "Digital overwhelm may disconnect you from natural rhythms",
      "Solid Character": "External pressures may compromise your authentic self"
    };
    
    return {
      strengths: strengths.map(s => s.name),
      weaknesses: weaknesses.map(w => w.name),
      opportunities: weaknesses.map(w => opportunities[w.name]),
      threats: weaknesses.map(w => threats[w.name])
    };
  };

  const getNextSteps = (weakestDimension) => {
    const steps = {
      "Mental Resilience": "You may be more reactive than you realize. Start with 5 minutes daily of observing your thoughts without judgment.",
      "Informational Sovereignty": "You're likely being influenced more than you know. Begin by auditing what you consumed in the last 24 hours - where did it come from?",
      "Real Community": "You may be more isolated than you feel. Initiate one meaningful face-to-face conversation this week.",
      "Active Creation": "You're in consumption mode. Create something small this week - write, build, solve a problem.",
      "Natural Connection": "You're over-digitized. Spend 20 minutes outside today without your phone.",
      "Solid Character": "You may be drifting. Write down your top 3 values and one way to honor each this week."
    };
    return steps[weakestDimension] || "Focus on small, consistent improvements in your lowest-scoring area.";
  };

  const allQuestionsAnswered = () => {
    const totalQuestions = dimensions.reduce((total, dim) => total + dim.questions.length, 0);
    const allRated = Object.keys(responses).length === totalQuestions;
    const hasReflection = reflectionText.trim().length > 0;
    const hasEmail = userEmail.trim().length > 0 && userEmail.includes('@');
    const hasConsent = emailConsent;
    return allRated && hasReflection && hasEmail && hasConsent;
  };

  const sendResults = async () => {
    setIsSubmitting(true);
    
    const { dimensionScores, totalScore } = calculateScores();
    const readinessLevel = getReadinessLevel(totalScore);
    const weakestArea = getWeakestArea(dimensionScores);
    const swotAnalysis = getSWOTAnalysis(dimensionScores);

    const emailContent = `
CONSCIOUSNESS ASSESSMENT RESULTS
================================

User Email: ${userEmail}
Total Score: ${totalScore}/150
Readiness Level: ${readinessLevel.level}

DIMENSION SCORES:
${dimensionScores.map(dim => `• ${dim.name}: ${dim.score}/25 (${Math.round((dim.score/dim.maxScore)*100)}%)`).join('\n')}

WEAKEST AREA: ${weakestArea.name}

SWOT ANALYSIS:
Strengths: ${swotAnalysis.strengths.join(', ')}
Weaknesses: ${swotAnalysis.weaknesses.join(', ')}

REFLECTION ON CONSISTENCY:
"${reflectionText}"

OPPORTUNITIES:
${swotAnalysis.opportunities.map((opp, i) => `${i+1}. ${opp}`).join('\n')}

THREATS:
${swotAnalysis.threats.map((threat, i) => `${i+1}. ${threat}`).join('\n')}

Assessment completed at: ${new Date().toLocaleString()}
    `.trim();

    try {
      // Load EmailJS if not already loaded
      if (typeof window.emailjs === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
          script.onload = () => {
            window.emailjs.init('fnZDUE4avDWT15kC4');
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      await window.emailjs.send('service_byxhxq1', 'template_ntuuq52', {
        to_email: userEmail,
        copy_to: 'sville92@gmail.com',
        results_content: emailContent,
        total_score: totalScore,
        readiness_level: readinessLevel.level
      });
      
      setIsSubmitting(false);
      setShowResults(true);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setIsSubmitting(false);
      alert('Failed to send results. Please try again.');
    }
  };

  const { dimensionScores, totalScore } = showResults ? calculateScores() : { dimensionScores: [], totalScore: 0 };
  const readinessLevel = showResults ? getReadinessLevel(totalScore) : null;
  const weakestArea = showResults && dimensionScores.length > 0 ? getWeakestArea(dimensionScores) : null;
  const swotAnalysis = showResults && dimensionScores.length > 0 ? getSWOTAnalysis(dimensionScores) : null;

  if (showResults) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Your Consciousness Map</h1>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg">
            <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{totalScore}/150</div>
            <div className={`text-lg sm:text-xl font-semibold ${readinessLevel.color} mb-2`}>
              {readinessLevel.level}
            </div>
            <p className="text-sm sm:text-base text-gray-600">{readinessLevel.description}</p>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 bg-indigo-50 p-4 sm:p-6 rounded-lg border-l-4 border-indigo-400">
          <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-3">📧 Results Sent Successfully!</h3>
          <p className="text-sm sm:text-base text-indigo-700 mb-2">
            Your consciousness assessment results have been sent to: <strong>{userEmail}</strong>
          </p>
          <p className="text-xs sm:text-sm text-indigo-600">
            Check your inbox (and spam folder) for your detailed analysis and personalized recommendations.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">Your Consciousness Profile</h3>
          <div className="overflow-x-auto">
            <RadarChart data={dimensionScores} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {dimensionScores.map((dimension, index) => (
            <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{dimension.name}</h3>
              <div className="flex items-center mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 mr-3">
                  <div 
                    className="bg-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(dimension.score / dimension.maxScore) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {dimension.score}/{dimension.maxScore}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round((dimension.score / dimension.maxScore) * 100)}%
              </div>
            </div>
          ))}
        </div>

        {swotAnalysis && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">Your Strategic Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">💪 Strengths</h4>
                <ul className="text-green-700 text-xs sm:text-sm space-y-1">
                  {swotAnalysis.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">⚠️ Weaknesses</h4>
                <ul className="text-red-700 text-xs sm:text-sm space-y-1">
                  {swotAnalysis.weaknesses.map((weakness, index) => (
                    <li key={index}>• {weakness}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">🚀 Opportunities</h4>
                <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                  {swotAnalysis.opportunities.map((opportunity, index) => (
                    <li key={index}>• {opportunity}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">⚡ Threats</h4>
                <ul className="text-yellow-700 text-xs sm:text-sm space-y-1">
                  {swotAnalysis.threats.map((threat, index) => (
                    <li key={index}>• {threat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {reflectionText && (
          <div className="bg-purple-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8 border-l-4 border-purple-400">
            <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3">Your Reflection on Consistency</h3>
            <div className="bg-white p-3 sm:p-4 rounded border text-sm sm:text-base text-gray-700 italic">
              "{reflectionText}"
            </div>
            <p className="text-xs sm:text-sm text-purple-600 mt-3">
              This insight about your consistency challenges is valuable data. Notice how it might connect to your lowest-scoring dimensions above.
            </p>
          </div>
        )}

        {weakestArea && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
              Your Area for Growth: {weakestArea.name}
            </h3>
            <p className="text-sm sm:text-base text-yellow-700 mb-4">
              {getNextSteps(weakestArea.name)}
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">Your Next Steps</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-2 text-sm sm:text-base">
            <li>Focus on your lowest-scoring dimension: <strong>{weakestArea?.name}</strong></li>
            <li>Choose one specific action from the suggestion above</li>
            <li>Commit to it for one week before adding anything else</li>
            <li>Retake this assessment in 30 days to track your evolution</li>
          </ol>
          <p className="text-blue-600 mt-4 text-xs sm:text-sm">
            Remember: This isn't about perfection. It's about conscious development and knowing where you are so you can navigate where you're going.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setShowResults(false);
              setResponses({});
              setReflectionText('');
              setUserEmail('');
              setEmailConsent(false);
            }}
            className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            Take Assessment Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Conscious Evolution Self-Assessment</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">Where Are You on the Journey?</p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">📋 Assessment Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">⏱️ 8-12 minutes</div>
              <div className="text-gray-600">Time to complete</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">🎯 Your clarity</div>
              <div className="text-gray-600">Know where you stand</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">🗺️ Your roadmap</div>
              <div className="text-gray-600">Personalized next steps</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mt-4 italic">
            This assessment maps your current readiness for navigating technological change while maintaining your autonomy and authentic self. You'll discover your strongest areas and biggest growth opportunities across 6 key dimensions.
          </p>
        </div>

        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Instructions:</strong> For each statement, rate yourself honestly on a scale of 1-5:
          </p>
          <div className="text-xs text-blue-700 mt-2 grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-2">
            <span><strong>1</strong> = Never/Strongly Disagree</span>
            <span><strong>2</strong> = Rarely/Disagree</span>
            <span><strong>3</strong> = Sometimes/Neutral</span>
            <span><strong>4</strong> = Often/Agree</span>
            <span><strong>5</strong> = Always/Strongly Agree</span>
          </div>
        </div>
      </div>

      {dimensions.map((dimension, dimIndex) => (
        <div key={dimIndex} className="mb-6 sm:mb-8 bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            Dimension {dimIndex + 1}: {dimension.name}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 italic">{dimension.description}</p>
          
          {dimension.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-4 bg-white p-3 sm:p-4 rounded border">
              <p className="text-sm sm:text-base text-gray-800 mb-3">{question}</p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {[1, 2, 3, 4, 5].map(value => (
                  <label key={value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`${dimIndex}-${qIndex}`}
                      value={value}
                      onChange={(e) => handleResponse(dimIndex, qIndex, e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="mb-6 sm:mb-8 bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-blue-400">
        <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-3">Reflection Question</h2>
        <p className="text-sm sm:text-base text-blue-700 mb-4">
          <strong>What is your biggest obstacle to staying consistent in areas that matter most to you?</strong>
        </p>
        <p className="text-xs sm:text-sm text-blue-600 mb-4 italic">
          Think about the gap between knowing what you should do and actually doing it consistently. Is it attention scattered across too many things? Lack of clear systems? External pressures? Internal resistance? Be honest with yourself.
        </p>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Take a moment to reflect and write your honest response here..."
          className="w-full h-24 sm:h-32 p-3 border border-blue-200 rounded-lg resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6 sm:mb-8 bg-green-50 p-4 sm:p-6 rounded-lg border-l-4 border-green-400">
        <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-3">📧 Get Your Results</h2>
        <p className="text-sm sm:text-base text-green-700 mb-4">
          Enter your email to receive your personalized consciousness map and strategic recommendations.
        </p>
        
        <div className="mb-4">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full p-3 border border-green-200 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="emailConsent"
            checked={emailConsent}
            onChange={(e) => setEmailConsent(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="emailConsent" className="text-xs sm:text-sm text-green-700">
            I agree to receiving my assessment and occasional insights on consciousness growth and development.
            <span className="italic"> (No spam, unsubscribe anytime)</span>
          </label>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={sendResults}
          disabled={!allQuestionsAnswered() || isSubmitting}
          className={`px-6 sm:px-8 py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors w-full sm:w-auto ${
            allQuestionsAnswered() && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Results...
            </span>
          ) : allQuestionsAnswered() ? 
            'Send My Results & View Dashboard' : 
            `Complete Assessment (${Object.keys(responses).length}/30 questions, ${reflectionText.trim() ? '✓' : '✗'} reflection, ${userEmail.includes('@') ? '✓' : '✗'} email, ${emailConsent ? '✓' : '✗'} consent)`
          }
        </button>
        
        {!allQuestionsAnswered() && (
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            Please complete all sections above to receive your personalized consciousness map.
          </p>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ConsciousnessAssessment />
    </div>
  );
}

export default App
