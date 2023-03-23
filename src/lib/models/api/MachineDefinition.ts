export default interface MachineDefinition {
	id: string;
	name: string;
	limits: {
		xmin: number;
		xmax: number;
		ymin: number;
		ymax: number;
		zmin: number;
		zmax: number;
	};
}
