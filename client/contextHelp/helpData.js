define([], function() {

var helpExamples = new Object();

helpExamples.Positioning_Statement = {
	'Product_Marketing_Director1': {
		Target_Audience: "Marketing executives and other executive management in my company",
		Problem_Statement: "To to ensure growth of key product brands in a challenging economic, regulatory and market environment",
		Category: "I am a results-oriented product marketing executive",
		Value_Proposition: "Who has proven her ability to adapt and execute brand marketing strategies rapidly for successful growth of her products in spite of current challenges.",
		Competitive_Differentiation: "Unlike other product marketing directors, my leadership in influential external organizations has enhanced my company's brand, my performance as a marketer and my role as a  thought leader."
	},
	'Product_Marketing_Director2': {
		Target_Audience: "For hiring executives at cloud services companies",
		Problem_Statement: "Who need a product marketing director who can bring new technologies to market in a timely and successful manner",
		Category: "I am a product marketing director with 15 years experience delivering strong results at web services companies",
		Value_Proposition: "Who successfully brings new technology to market from strategy to implementation, as evidenced by the success of the XYZ Widget.",
		Competitive_Differentiation: "Unlike many product marketing professionals, my computer sciences degree and marketing background enable me to understand customer needs and communicate effectively with product management and engineering."
	},
	'Marketing_Director': {
		Target_Audience: "Executive leadership",
		Problem_Statement: "Who need to continue to grow sales and revenues but are concerned that negative publicity about the high cost of prescription drugs will damage the brand and blunt sales",
		Category: "As the Managed Care Marketing Director, my team of 40 professionals enables the company to meet our brand promise of giving access to our drugs, regardless of a patient&rsquo;s ability to pay.",
		Value_Proposition: "We deliver on this promise by developing and educating on our industry-leading patient access programs with stakeholders both inside and outside the company.",
		Competitive_Differentiation: "Unlike other Managed Care Marketing managers, I am a patient access expert with a strong track record of organizational change management."
	},
	'HR_Director': {
		Target_Audience: "COO and executive management team in my company",
		Problem_Statement: "Who want to grow the company through M&A but are concerned about retaining key talent and maintaining a strong corporate culture",
		Category: "I am a visionary and performance-focused HR director",
		Value_Proposition: "Who excels at innovative programs for strategic talent retention and enhancing corporate culture",
		Competitive_Differentiation: "Unlike other HR directors, I have developed a unique education and mentoring program called TalentED that has been proven not only to retain key employees but to further differentiate our company for recruits."
	},
	'Client_Services_Director': {
		Target_Audience: "CEO and executive leadership in my company",
		Problem_Statement: "Who want to increase growth and profits; and raise our brand presence in the market",
		Category: "I am the director of client services with proven business development skills and a strong network",
		Value_Proposition: "Who can significantly increase sales and raise our brand image in the market through my thought leadership and presence in the industry",
		Competitive_Differentiation: "Unlike other client services managers, I am highly visible with regional leadership in key professional organizations and have a proven track record of keeping clients loyal to our brand."
	},
	'Software_Engineer': {
		Target_Audience: "For executives and technology management",
		Problem_Statement: "Who require industry-wide adoption of company technology to accomplish the corporate vision",
		Category: "I am an open source software visionary with a proven track record of industry leadership and execution",
		Value_Proposition: "Who can accelerate industry adoption and standardization around our technology",
		Competitive_Differentiation: "Unlike other open source developers, I have shown the ability to deliver technology initiatives and drive open source projects that further strategic corporate objectives."
	},
	'SAP_Project_Manager': {
		Target_Audience: "For financial management in my company",
		Problem_Statement: "Who need to manage finances and financial reporting while maintaining regulatory compliance and pursuing process improvements",
		Category: "I am the SAP solutions expert managing critical finance systems projects",
		Value_Proposition: "Who provides proven technology and systems leadership that enable SAP projects to meet strategic company goals on time and on budget. ",
		Competitive_Differentiation: "Unlike other solutions experts, I excel at communications and team leadership, and have a track record of on-time and on-budget implementations."
	},
	'Accountant1': {
		Target_Audience: "For executive management in my accounting firm",
		Problem_Statement: "Who need to increase company growth through development of the Asian market",
		Category: "I am an tri-lingual senior accountant with an excellent track record of client development and management",
		Value_Proposition: "Who can provide leadership and results in new business development in the Asian market",
		Competitive_Differentiation: "Unlike other accountants at our firm, I am a key resource for our Asian and US offices having worked as an accountant in Hong Kong, Beijing and Singapore with language fluency in English, Mandarin and Cantonese."
	},
	'Accountant2': {
		Target_Audience: "CEO and Executives in my accounting firm",
		Problem_Statement: "To increase growth and profits; and raise our brand presence in the market",
		Category: "A rainmaker with a strong network for accounting business development",
		Value_Proposition: "Can significantly increase sales and raise our brand image in the market through my thought leadership presence in the industry",
		Competitive_Differentiation: "Other accountants, I am working on a new model for creative financing in this tight economic market."
	}
};

helpExamples.Elevator_Pitch = {
	'Corporate_Lawyer': {
		Five_Second: "I’m George Paulsen of ABC Corporation.  I’m a corporate attorney that specializes in intellectual property.",
		Fifteen_Second: "Protecting our intellectual property is key for a company whose fortunes rise and fall on our innovations.",
		Thrity_Second: "I recently led the effort to streamline our patent portfolio and have been speaking nationally on the topic of managing the legal issues in innovation."
	},
	'Business_Process_Director': {
		Five_Second: "I’m Jennifer Song.  I head business process excellence for XYZ Corp.",
		Fifteen_Second: "Business process excellence is a requirement for global  competitiveness. \nOur group helps to meet competitive pressures with better business processes. We enable the company be more streamlined and productive while retaining high quality.",
		Thrity_Second: "We recently reduced costs and cycle time by more than 25% in manufacturing by working with an interdisciplinary group to  identify and eliminate problem areas where processes bogged down between departments."
	},
	'Marketing_Director': {
		Five_Second: "I’m Julie Jones.  I’m the Director of Managed Care Marketing for ABC Corp.",
		Fifteen_Second: "We deliver on our brand promise of giving access to our drugs, regardless of a patient’s ability to pay. \nWe develop innovative patient access programs and communicate them to all stakeholders inside and outside the company.",
		Thrity_Second: "If doctors think their patients can’t afford our drugs, they won’t prescribe them. We’ve dramatically raised professional awareness of our patient access programs to ensure that appropriate patients receive care regardless of ability to pay—39% unaided recall in just one year."
	},
	'SAP_Systems_Specialist': {
		Five_Second: "I’m Pat Smith. \nThe SAP solutions expert at ABC Corp.",
		Fifteen_Second: "I’m responsible for meeting our corporate goals through SAP technology integration \nWe’ve had a good track record of meeting our project budgets and deadlines despite high expectations",
		Thrity_Second: "For instance, we had only six months to pull off a major SAP technology integration that was key to a strategic change management initiative \nI think our experience and strong team communications helped us meet the time and budget challenges."
	},
	'Product_Marketing_Director': {
		Five_Second: "Hi, I’m Gerry Smith.  I bring new technologies to market for XYZ Company.  We’re the leader in cloud widgets.  I work as a product marketing director there.",
		Fifteen_Second: "I’m the rare technology geek who can speak the customer’s language.  Many technology companies fail because they can’t translate cool technology into real customer benefits.",
		Thrity_Second: "The secret is finding a target customer who has a point of pain that you can fix with your product.  That’s what we did with the launch of the XYZ Widget, one of my products that now represents 40% of our revenues. \nBecause of my technical background, I work well translating between engineering and our customers, and vice versa.  The result is a product that best matches what our customers want."
	}
};

helpExamples.Brand_Strategy = {
	'SAP_Systems_Integrator': {
		Core_Values: [ "Engagement", "Leading-edge", "Reliability", "Enjoying life, enjoying others"],
		Hard_Skills: "SAP solutions\nStrong technical and systems background\nKnows how to streamline processes",
		Personality_Attributes: "Engaging\nPositive\nDirect\nCreative",
		Brand_Associations: "SAP solutions expert\nStrong team leader\nFun to work with",
		Rational_Value: "SAP solutions expertise and  team leadership",
		What_I_Love_Doing: "Partnering with others to realize a vision",
		Soft_Skills: "Communications\nCreative problem solver\nTeam builder",
		Type_Of_Leader_Worker: "Reliable\n>Delivers on promises\nHelpful\nYou know where you stand",
		External_Image: "Geek chic\nConfident\nHonest\nLikeable\nGood communicator",
		Emotional_Value: "Others feel... \nSecure that project will go as planned \nHave fun working together",
		Career_Dreams: "Short-term: Leading an enterprise-wide change management project",
		Expertise: "SAP certification \nLarge company implementations",
		Brand_Metaphor: "MINI Cooper\n\"Retro yet modern style, superb fuel efficiency and a fun-by-design\"",
		Relationship_Image: "Willing partner \nWin/win attitude",
		Brand_Experience: "Smooth, transparent process with expert \nFun \nCollaborative"
	},
	'HR_Director': {
		Core_Values: [ "Trust", "Innovation", "Helping others", "" ],
		Hard_Skills: "Organizational development \nLeadership on global HR projects \nCreative problem solving",
		Personality_Attributes: "Inspiring with humor and example \nPositive \nCreative",
		Brand_Associations: "Global HR projects \nInnovative programs \nThat cool HR mgr",
		Rational_Value: "Creative HR leadership on global projects",
		What_I_Love_Doing: "Empowering others to realize their potential",
		Soft_Skills: "Communications \nMulticultural understanding",
		Type_Of_Leader_Worker: "Leads by example \nDelivers on promises \nTrustworthy",
		External_Image: "Professional with a creative flair \nConfident but approachable",
		Emotional_Value: "Others feel... \nEmpowered by clear career vision & skills",
		Career_Dreams: "Short-term: Develop a world-class career resource and coaching center",
		Expertise: "HR processes and tools \nCareer development",
		Brand_Metaphor: "George Clooney.  Moral leadership (Darfur), loyal friend, charming and likeable, professional but knows how to have fun with panache.",
		Relationship_Image: "Supportive \nLoyal \nFun",
		Brand_Experience: "Successful collaborations with a fun and effective leader \nCreative process and results"
	},
	'Managed_Care_Marketing_Director': {
		Core_Values: [ "Thought leadership", "Continual personal/professional growth", "Accountability", ""],
		Hard_Skills: "Strategic marketing and planning \nMarket research and analysis \nP&L management",
		Personality_Attributes: "Dynamic and direct \nPassionate \nPersonable with a sense of humor",
		Brand_Associations: "Patient access expert \nManaged care marketing \nChange management leader",
		Rational_Value: "Patient access thought leader \nManaged care marketing strategist \nStrong financial results",
		What_I_Love_Doing: "Helping patients gain access to the therapies they need",
		Soft_Skills: "People management \nTeam leadership \nAdaptability \nCross-functional networking",
		Type_Of_Leader_Worker: "Leads by example \nAccountability is key \nMentors well \nHonest",
		External_Image: "Professional, but warm appearance \nConfident  \nConnected \nSocial and likeable",
		Emotional_Value: "Others feel… \nEmpowered by my leadership \nConfident of results \nValued",
		Career_Dreams: "Health care advocate who helps close the gap in health care disparities",
		Expertise: "Patient access \nManaged care marketing \nChange management \nBiology/MPH degrees",
		Brand_Metaphor: "Ellen Degeneres \nWarm, witty, and smart \nComfortable in own skin",
		Relationship_Image: "Trusted partner \nWilling to help \nPuts others at ease",
		Brand_Experience: "Patient access leader who builds and empowers teams to achieve results in a supportive and fun environment"
	}
};

var mainContent = new Object();

mainContent.Workbook = {
	'Title': {
		bgcolor: 'lightgray',
		text: '<p>Workbook title. Usually, the title conveys the objective you are pursuing.</p>'
	}
};

mainContent.Tags = {
	bgcolor: '#66CCFF',
	text: '<p>Tags are descriptive words that categorize your saved templates. A tag can be an audience, industry, a draft number, or any other organizing word or phrase. Tagging your work can be useful for searching for saved templates in the My Saved Work tool (see button in upper right).</p>'
};

mainContent.Assessment = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p>The Personal Brand Assessment questionnaire allows you to ask colleagues for feedback on your personal brand. '+
			'Enter the names and emails of the people to whom you\'d like to send the questionnaire, and also enter a due date. '+
			'When all entries have been provided, click "Send Invitations", which will send emails to your colleagues '+
			'with instructions on how to provide feedback. </p>'+
			'<p>After the due date arrives, you can close the questionnaire (a "Close Questionnaire" button will appear automatically). '+
			'After closing the questionnaire, the software '+
			'will consolidate (and partially randomize) the feedback, and you will be able to see the feedback by returning to this page.</p>'+
			'<p>Optionally, you can fill out the same questionnaire yourself (shown under the "Send Invitations" button below) '+
			'as a self-assessment. If you fill out a self-assessment, then upon closing the questionnaire, '+
			'the software will show your self-assessment side-by-side with the feedback received from your colleagues.</p>'
	},
	'Core_Values': {
		bgcolor: '#ccc',
		text: '<p>Sample core values:</p><ul>'+
'<li>Trust</li>'+
'<li>Courage</li>'+
'<li>Respect</li>'+
'<li>Integrity</li>'+
'<li>Passion</li>'+
'<li>Innovation</li>'+
'<li>Transparency</li>'+
'<li>Adaptability</li>'+
'<li>Reliability</li>'+
'<li>Accountability</li>'+
'<li>Honesty</li>'+
'<li>Giving back</li>'+
'<li>Leadership</li>'+
'<li>Vision</li>'+
'<li>Quality</li>'+
'<li>Diversity</li>'+
'<li>Thought leadership</li>'+
'<li>Service</li>'+
'<li>Helping others</li>'+
'<li>Education</li>'+
'<li>Competence</li>'+
'<li>Respect</li>'+
'<li>Responsibility</li>'+
'<li>Open mind</li>'+
'<li>Friendship</li>'+
'<li>Determination</li>'+
'</ul>'
	},
	'Skills_Strengths_and_Expertise': {
		bgcolor: '#ccc',
		text: '<p>Sample skills, strengths and expertise:</p><ul>'+
'<li>Project management</li>'+
'<li>People management</li>'+
'<li>Financial management</li>'+
'<li>Operations management</li>'+
'<li>Technical expertise</li>'+
'<li>Strategic planning</li>'+
'<li>Managing conflict</li>'+
'<li>Creative problem solving</li>'+
'<li>Delivering presentations</li>'+
'<li>Decision making</li>'+
'<li>Mentoring</li>'+
'<li>Communication</li>'+
'<li>Strategic vision</li>'+
'<li>Collaboration and teamwork</li>'+
'<li>Building and leading teams</li>'+
'<li>Leading innovation</li>'+
'<li>Global strategies</li>'+
'<li>Streamlining processes</li>'+
'<li>Domain expertise</li>'+
'<li>Driving for results</li>'+
'<li>Change management</li>'+
'</ul>'
	},
	'Weaknesses': {
		bgcolor: '#ccc',
		text: '<p>Weaknesses</p>'
	},
	'Value_Proposition': {
		bgcolor: '#ccc',
		text: '<p>Value_Proposition</p>'
	},
	'Perceived': {
		bgcolor: '#ccc',
		text: '<p>Perceived</p>'
	},
	'Personality_Attributes': {
		bgcolor: '#ccc',
		text: '<p>Sample personality attributes:</p><ul>'+
'<li>Visionary</li>'+
'<li>Positive</li>'+
'<li>Strategic</li>'+
'<li>Creative</li>'+
'<li>Present</li>'+
'<li>Focused</li>'+
'<li>Flexible</li>'+
'<li>Inspirational</li>'+
'<li>Sense of humor</li>'+
'<li>Compassionate</li>'+
'<li>Patient</li>'+
'<li>Results-oriented</li>'+
'<li>Analytical</li>'+
'<li>Confident</li>'+
'<li>Competent</li>'+
'<li>Expert</li>'+
'<li>Unflappable</li>'+
'<li>Driven</li>'+
'<li>Passionate</li>'+
'<li>Collaborative</li>'+
'<li>Personable</li>'+
'<li>Energetic</li>'+
'<li>Friendly</li>'+
'</ul>'
	},
	'Look_and_Style': {
		bgcolor: '#ccc',
		text: '<p>Sample image attributes:</p><ul>'+
'<li>Sophisticated</li>'+
'<li>Elegant</li>'+
'<li>Edgy</li>'+
'<li>Buttoned-down</li>'+
'<li>Classic</li>'+
'<li>Business casual</li>'+
'<li>Fashion forward</li>'+
'<li>Urban</li>'+
'<li>Artistic</li>'+
'<li>Establishment</li>'+
'<li>Couture</li>'+
'<li>Technology savvy</li>'+
'<li>Worldly</li>'+
'<li>Cultured</li>'+
'<li>Hip</li>'+
'<li>Colorful</li>'+
'<li>Conservative</li>'+
'<li>Academic</li>'+
'<li>Professional</li>'+
'<li>Geek chic</li>'+
'<li>Entrepreneurial</li>'+
'<li>Leader</li>'+
'</ul>'
	},
	'Leadership': {
		bgcolor: '#ccc',
		text: '<p>Leadership</p>'
	},
	'Engagement': {
		bgcolor: '#ccc',
		text: '<p>Engagement</p>'
	},
	'Best_Representation': {
		bgcolor: '#ccc',
		text: '<p>Best_Representation</p>'
	}
};

mainContent.Positioning_Statement = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p>A positioning statement is an internal tool that helps to ensure that your rational value is compelling to a particular audience.</p>'+
			'<p>Remember that we “bake the cake, then ice it.”  The cake is your positioning.  This is the foundation for a strong brand.  Without it, your brand would be all fluff or icing—not very substantial or credible.</p>'+
			'<p>Write different positioning statements for different audiences because the value messages change for each target.  Refer to these various positioning statements to understand an audience’s care-abouts and customize your value messages accordingly when you communicate with them.</p>',
		seeAlso: {
			'Positioning Statement fields:':{
				'Target Audience':'Positioning_Statement.Target_Audience',
				'Problem Statement':'Positioning_Statement.Problem_Statement',
				'Category':'Positioning_Statement.Category',
				'Value Proposition':'Positioning_Statement.Value_Proposition',
				'Competitive Differentiation':'Positioning_Statement.Competitive_Differentiation',
				'Evidence':'Positioning_Statement.Evidence'
			}
		}
	},
	'Title': {
		bgcolor: 'lightgray',
		text: '<p>The title for this Positioning Statement.</p>'
	},
	'Target_Audience': {
		bgcolor: '#CC0000',
		text: '<p>What audiences have influence over how you are perceived and how successful you are?  Fill a separate positioning statement out for each audience.  If you are employed by a company, your audiences might include: Executives, R&D, Marketing, or Finance.  A consultant’s audiences might include different target customer segments or service partners.</p>'
	},
	'Problem_Statement': {
		bgcolor: '#660099',
		text: '<p>What is the target audience’s problem and what is the challenge to solving their problem that you can address?  The problem should be a current point of pain for the target audience.</p>'
	},
	'Category': {
		bgcolor: '#669900',
		text: '<p>Generally, your category description (such as function and title) should remain constant for all audiences.  By consistently messaging your functional association, people will have an easier time remembering who you are and what you do.</p>'
	},
	'Value_Proposition': {
		bgcolor: '#0099CC',
		text: '<p>Your value proposition should answer a problem or point of pain that the target audience has.</p>'
	},
	'Competitive_Differentiation': {
		bgcolor: '#FF9900',
		text: '<p>Articulate what makes you different from others in the context of providing value to the target audience.  It’s possible that you may have already addressed your differentiation in your value proposition.</p>'
	},
	'Evidence': {
		bgcolor: '#0066CC',
		text: '<p>Every positioning claim should be backed up by evidence or proof points.  Use this section to list your evidence.  For instance, if you claim thought leadership, back it up with proof such as speaking engagements, articles, blog posts or media mentions.</p>'
	}
};

mainContent.Elevator_Pitch = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p><b>An Elevator Pitch is a tool to help us be concise and compelling about our positioning when we introduce ourselves.  It’s called an Elevator Pitch because these are messages that could theoretically be communicated in the short span of an elevator ride.</b></p>'+
			'<p>Think of the Elevator Pitch as key positioning messages that you could weave into a conversation given various amounts of time.  It is often necessary to have different elevator pitches for different audiences, for instance, one for technical audiences and one for lay audiences.</p>'+
			'<p>Remember to be conversational as no one wants to hear a “canned” speech.  Practice often, as the more you do, the more natural you will sound.</b></p>'
	},
	'Title': {
		bgcolor: 'lightgray',
		text: '<p>The title for this Elevator Pitch.</p>'
	},
	'What_I_Do_(or_Want_to_Do)': {
		bgcolor: '#CC0000',
		text: '<p>In a few seconds, make sure your audience knows your name and what you do or what you should be remembered for.  Your name and your company’s name (or department’s name or function) are key elements of your brand.</p>'
	},
	'Context_and_Value': {
		bgcolor: '#669900',
		text: '<p>Add your value messages.  Perhaps you are the international distribution expert or the product quality guru.  Provide context around your area of expertise and why your function is important.</p>'
	},
	'Evidence': {
		bgcolor: '#660099',
		text: '<p>Add examples that back up your positioning claims.  For instance, you could point to a new product quality process that you created and the positive results such as reduced product defects.</p>'
	}
};

mainContent.Brand_Strategy = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p><b>The Brand Strategy template helps you to understand who you are and what your brand stands for.</b>  It brings together your Rational Value (cake) and Emotional Value (icing).  Use the template twice—first, capture your Current Brand and second, use another template to map out your Desired Brand.</p>'+
			'<p>Although the Brand Strategy template includes some of your Rational Value (see Strengths section), its main focus is on your Emotional Value.  Once filled out, it provides a holistic look at your personal brand.</p>'+
			'<p>When you are done with your Desired Brand strategy, try to articulate three brand descriptors that are key to communicating your rational and emotional value.  For instance, choose descriptors from Brand Association, Brand Personality, and Brand Image.</p>'
	},
	'Title': {
		bgcolor: 'lightgray',
		text: '<p>The title for this Brand Strategy.</p>'
	},
	'Core_Values': {
		bgcolor: '#CC0000',
		text: '<p>What are the core values that drive who you are and what you are all about?  Try to narrow the list to just a handful.  Core values help you to have meaning in what you do and to “do the right thing” in your career, relationships and life.</p>'
	},
	'Strengths': {
		bgcolor: '#669900',
		text: '<p>This section helps you to articulate both the hard skills and soft skills and other attributes that make up your strengths.  When you are doing a snapshot of your current brand, it is helpful to identify weaknesses that can, hopefully, be improved upon as you progress toward your desired brand.</p>'+
			'<p>In the professional world, being an expert in a domain area is important.  If you don’t have an area of expertise, it is important to develop one.  It can be a technical area, a market area or an area in which you provide thought leadership.</p>'
	},
	'Personality': {
		bgcolor: '#660099',
		text: '<p>Remember the metaphor of the cake as Rational Value and the icing as Emotional Value?  The Brand Personality section defines aspects of your Emotional Value.</p>'+
			'<p>What are your personality and character attributes?  For instance, are you an inspiring and charismatic leader, or a quiet, dependable team player?  Are you someone who people would want to lead their team, go out for drinks with or work on their project?  What are those attributes that attract people to you, that make them like you?</p>'+
			'<p>The Brand Metaphor can help to free you in how you think about your brand.  For instance, finding a celebrity, retail store or car brand that personifies the essence of your brand can help you to be clear about your brand type.  If a luxury hotel is your brand metaphor, you’ll know that the highest quality, service and customer experience is key to what you are about. Your behaviors and communication should reflect these values.</p>'
	},
	'Brand_Image': {
		bgcolor: '#0099CC',
		text: '<p>This section should include what people should associate with your brand with words, ideas, and visuals.</p>'+ 
			'<p>The first association should be a tie to your professional function and value.  Then, people may conjure up an image of you—what you look like, your attitude, how you interact with others, your speaking style, your gestures.  They may also think about what kind of a relationship they have with you.</p>'
	},
	'Brand_Promise': {
		bgcolor: '#0066CC',
		text: '<p>What is your rational or functional value?  What should others expect from your work product or leadership?  To describe your emotional value, try to understand what others might feel in working with you or relating to you?  Do they feel relief, empowerment, trust that things will be done well, enjoyment, or respected?</p>'+
			'<p>The Brand Experience is the overall experience that we want others to have when they come into contact with our brand.</p>'
	},
	'Key_Brand_Descriptors': {
		bgcolor: '#FF6600',
		text: '<p>Summarize what\'s most important about your brand in three brand descriptors--that is, the essence of your \"cake and icing.\"  For instance, 1) Fill in your Brand Association or Rational Value here, 2) Add Skills, Personality or Leadership attributes and 3) Your Brand Image.  Here\'s an example: 1) Smart, energetic CEO of XYZ revolutionizing visual data sharing online, 2) Visionary and inspiring leader who delivers results, and 3) Charismatic, casual and fun to be with.'
	}
};

mainContent.Ecosystem_Model = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p><b>not yet written</p>'
	}
};

mainContent.Action_Plan = {
	'_sheet': {
		bgcolor: '#ccc',
		text: '<p><b>not yet written</p>'
	}
};


return {
	main: mainContent,
	examples: helpExamples
};

});

