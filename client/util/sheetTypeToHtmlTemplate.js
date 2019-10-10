define([
	'text!../assess/Assessment/Assessment_Form.html',
	'text!../fiveSteps/Positioning_Statement/Positioning_Statement_Form.html',
	'text!../fiveSteps/Elevator_Pitch/Elevator_Pitch_Form.html',
	'text!../fiveSteps/Brand_Strategy/Brand_Strategy_Form.html',
	'text!../fiveSteps/Ecosystem_Model/Ecosystem_Model_Form.html',
	'text!../fiveSteps/Action_Plan/Action_Plan_Form.html'
], function(
	Assessment_Form_html,
	Positioning_Statement_Form_html,
	Elevator_Pitch_Form_html,
	Brand_Strategy_Form_html,
	Ecosystem_Model_Form_html,
	Action_Plan_Form_html
) {
	return {
		'Positioning_Statement': Positioning_Statement_Form_html,
		'Elevator_Pitch': Elevator_Pitch_Form_html,
		'Brand_Strategy': Brand_Strategy_Form_html,
		'Ecosystem_Model': Ecosystem_Model_Form_html,
		'Action_Plan': Action_Plan_Form_html,
		'Assessment': Assessment_Form_html
	};
});
