export default interface FeederStatus {
	hold: boolean;
	holdReason: string;
	queue: number;
	pending: boolean;
	changed: boolean;
}
