define([
	'../assess/Assessment/Assessment',
	'../fiveSteps/Positioning_Statement/Positioning_Statement',
	'../fiveSteps/Elevator_Pitch/Elevator_Pitch',
	'../fiveSteps/Brand_Strategy/Brand_Strategy',
	'../fiveSteps/Ecosystem_Model/Ecosystem_Model',
	'../fiveSteps/Action_Plan/Action_Plan'
], function(
	Assessment,
	Positioning_Statement,
	Elevator_Pitch,
	Brand_Strategy,
	Ecosystem_Model,
	Action_Plan
) {
	return {
		'Positioning_Statement': Positioning_Statement,
		'Elevator_Pitch': Elevator_Pitch,
		'Brand_Strategy': Brand_Strategy,
		'Ecosystem_Model': Ecosystem_Model,
		'Action_Plan': Action_Plan,
		'Assessment': Assessment
	};
});
