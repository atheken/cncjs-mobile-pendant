export default interface SenderStatus {
	/**
	 * Streaming protocol. 1 for "send-response", 0 for "count characters." */
	sp: 0 | 1;

	/**
	 * Is g-code processing currently paused?
	 */
	hold: boolean;

	/**
	 * The reason g-code processing is currently paused.
	 *
	 * This may not be set if the pause was user-related.
	 */
	holdReason: {
		err: boolean;
		data: string;
		msg: string;
	};
	/**
	 * The name of the loaded gcode file.
	 */
	name: string;

	/**
	 * As much as is known about the current status of the sender's execution context.
	 */
	context: {
		global: any;
		xmin: number;
		xmax: number;
		ymin: number;
		ymax: number;
		zmin: number;
		zmax: number;
		mposx: number;
		mposy: number;
		mposz: number;
		mposa: number;
		mposb: number;
		mposc: number;
		posx: number;
		posy: number;
		posz: number;
		posa: number;
		posb: number;
		posc: number;
		modal: {
			motion: string;
			wcs: string;
			plane: string;
			units: string;
			distance: string;
			feedrate: string;
			spindle: string;
			coolant: string;
		};
		tool: number;
		params: object;
	};
	size: 0;
	/** The number of lines in the file */
	total: 0;
	/**
	 * The number of lines sent to the machine.
	 */
	sent: 0;
	/**
	 * The number of lines processed by the machine.
	 */
	received: 0;
	startTime: 0;
	finishTime: 0;
	/**
	 * Milliseconds elapsed since the this file started running.
	 */
	elapsedTime: 0;
	/**
	 * The estimated time remaining to process the file.
	 */
	remainingTime: 0;
}
