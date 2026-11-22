"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type StickerName =
	| "robotic-arm"
	| "gpu"
	| "chip"
	| "chip-stack"
	| "ember-gpu"
	| "projects"
	| "pcb"
	| "mail"
	| "phone"
	| "signal"
	| "fpga"
	| "iot-node"
	| "oscilloscope"
	| "neural-net"
	| "forge"
	| "terminal"
	| "certificate"
	| "buffer"
	| "cpu"
	| "publication-sorting"
	| "ibvs-vision"
	| "imitation"
	| "blade-inspection"
	| "doom-console"
	| "anc-headphones"
	| "edge-5g"
	| "fifo-display"
	| "board-bringup"
	| "resume"
	| "telemetry-dashboard"
	| "cloud";

type StickerPlacement = {
	name: StickerName;
	label: string;
	size: string;
	rotate: number;
	duration: number;
	delay: number;
	position: CSSProperties;
	className?: string;
};

type DragState = {
	name: StickerName;
	pointerId: number;
	startX: number;
	startY: number;
	baseX: number;
	baseY: number;
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
	moved: boolean;
};

const stickers: Record<StickerName, { label: string; src: string }> = {
	"robotic-arm": { label: "Robotic arm", src: "/stickers/robotic-arm.png" },
	gpu: { label: "GPU", src: "/stickers/gpu.png" },
	chip: { label: "Microchip", src: "/stickers/chip.png" },
	"chip-stack": { label: "Chip stack", src: "/stickers/chip-stack.png" },
	"ember-gpu": { label: "EMBER GPU", src: "/stickers/ember-gpu.png" },
	projects: { label: "Projects folder", src: "/stickers/projects.png" },
	pcb: { label: "Circuit board", src: "/stickers/pcb.png" },
	mail: { label: "Email", src: "/stickers/mail.png" },
	phone: { label: "Phone", src: "/stickers/phone.png" },
	signal: { label: "Radio signal", src: "/stickers/signal.png" },
	fpga: { label: "FPGA board", src: "/stickers/fpga.png" },
	"iot-node": { label: "IoT sensor node", src: "/stickers/iot-node.png" },
	oscilloscope: { label: "Oscilloscope trace", src: "/stickers/oscilloscope.png" },
	"neural-net": { label: "Neural network chip", src: "/stickers/neural-net.png" },
	forge: { label: "Launch pad", src: "/stickers/forge.png" },
	terminal: { label: "Code window", src: "/stickers/terminal.png" },
	certificate: { label: "Achievement badge", src: "/stickers/certificate.png" },
	buffer: { label: "FIFO buffer", src: "/stickers/buffer.png" },
	cpu: { label: "Processor die", src: "/stickers/cpu.png" },
	"publication-sorting": { label: "Visual servoing sorting cell", src: "/stickers/publication-sorting.png" },
	"ibvs-vision": { label: "Camera-guided robotic arm", src: "/stickers/ibvs-vision.png" },
	imitation: { label: "Imitation learning arm", src: "/stickers/imitation.png" },
	"blade-inspection": { label: "Blade inspection", src: "/stickers/blade-inspection.png" },
	"doom-console": { label: "Retro gaming console", src: "/stickers/doom-console.png" },
	"anc-headphones": { label: "Noise-cancelling headphones", src: "/stickers/anc-headphones.png" },
	"edge-5g": { label: "5G edge node", src: "/stickers/edge-5g.png" },
	"fifo-display": { label: "FIFO with 7-segment display", src: "/stickers/fifo-display.png" },
	"board-bringup": { label: "Board bring-up", src: "/stickers/board-bringup.png" },
	resume: { label: "Resume", src: "/stickers/resume.png" },
	"telemetry-dashboard": { label: "Telemetry dashboard", src: "/stickers/telemetry-dashboard.png" },
	cloud: { label: "Cloud certification", src: "/stickers/cloud.png" },
};

const homeStickers: StickerPlacement[] = [
	{
		name: "robotic-arm",
		label: stickers["robotic-arm"].label,
		size: "clamp(84px, 9vw, 124px)",
		rotate: -8,
		duration: 7.4,
		delay: 0,
		position: { left: "3%", top: "14%" },
	},
	{
		name: "gpu",
		label: stickers.gpu.label,
		size: "clamp(104px, 12vw, 168px)",
		rotate: 7,
		duration: 8.6,
		delay: 0.8,
		position: { right: "3%", top: "11%" },
	},
	{
		name: "chip",
		label: stickers.chip.label,
		size: "clamp(74px, 8vw, 110px)",
		rotate: 5,
		duration: 9.2,
		delay: 1.6,
		position: { left: "8%", bottom: "9%" },
	},
	{
		name: "chip-stack",
		label: stickers["chip-stack"].label,
		size: "clamp(82px, 9vw, 126px)",
		rotate: -6,
		duration: 7.9,
		delay: 0.4,
		position: { right: "8%", bottom: "8%" },
		className: "hidden sm:block",
	},
];

const projectsStickers: StickerPlacement[] = [
	{
		name: "projects",
		label: stickers.projects.label,
		size: "clamp(88px, 8vw, 124px)",
		rotate: 6,
		duration: 8.2,
		delay: 0.3,
		position: { right: "5%", top: "4%" },
		className: "hidden lg:block",
	},
	{
		name: "ember-gpu",
		label: stickers["ember-gpu"].label,
		size: "clamp(84px, 8vw, 120px)",
		rotate: -5,
		duration: 8.9,
		delay: 1.2,
		position: { right: "19%", top: "7%" },
		className: "hidden xl:block",
	},
	{
		name: "pcb",
		label: stickers.pcb.label,
		size: "clamp(84px, 8vw, 118px)",
		rotate: -7,
		duration: 7.6,
		delay: 0.7,
		position: { left: "3%", bottom: "3%" },
		className: "hidden lg:block",
	},
	{
		name: "signal",
		label: stickers.signal.label,
		size: "clamp(56px, 6vw, 82px)",
		rotate: 8,
		duration: 9.4,
		delay: 1.8,
		position: { right: "4%", bottom: "2%" },
		className: "hidden lg:block",
	},
];

const contactStickers: StickerPlacement[] = [
	{
		name: "mail",
		label: stickers.mail.label,
		size: "clamp(92px, 9vw, 132px)",
		rotate: -7,
		duration: 7.5,
		delay: 0.2,
		position: { left: "5%", top: "10%" },
		className: "hidden md:block",
	},
	{
		name: "phone",
		label: stickers.phone.label,
		size: "clamp(62px, 7vw, 92px)",
		rotate: 6,
		duration: 8.7,
		delay: 0.9,
		position: { right: "5%", top: "9%" },
		className: "hidden md:block",
	},
	{
		name: "signal",
		label: stickers.signal.label,
		size: "clamp(56px, 6vw, 82px)",
		rotate: 4,
		duration: 9.1,
		delay: 1.4,
		position: { left: "10%", bottom: "8%" },
		className: "hidden lg:block",
	},
];

const stickersByVariant = {
	home: homeStickers,
	projects: projectsStickers,
	contact: contactStickers,
};

const projectStickerNames: Record<string, StickerName[]> = {
	"bharat-forge": ["blade-inspection", "pcb"],
	"board-bring-up-peripheral-validation": ["board-bringup", "oscilloscope"],
	"cert-aws": ["certificate", "cloud"],
	"cert-google-adk": ["certificate", "pcb"],
	"cert-jj": ["certificate", "resume"],
	"edgeguard-5g": ["edge-5g", "signal"],
	"ember-gpu": ["ember-gpu", "chip-stack"],
	"fifo-buffer": ["fifo-display", "buffer"],
	"ibvs-robotic-arm": ["ibvs-vision", "robotic-arm"],
	"imitation-learning-robotic-arm": ["imitation", "neural-net"],
	"iot-gateway": ["iot-node", "telemetry-dashboard"],
	loomcode: ["terminal", "neural-net"],
	"noise-cancellation": ["anc-headphones"],
	resume: ["resume", "mail"],
	"riscv-doom-soc": ["doom-console", "cpu"],
	"riscv-processor": ["cpu", "fpga"],
	"sensor-interface-telemetry": ["oscilloscope", "telemetry-dashboard"],
	default: ["projects", "chip"],
};

const projectSlots: Omit<StickerPlacement, "name" | "label">[] = [
	{
		size: "clamp(70px, 7vw, 108px)",
		rotate: -6,
		duration: 8.3,
		delay: 0.4,
		position: { right: "4%", top: "20%" },
		className: "hidden lg:block",
	},
	{
		size: "clamp(60px, 6vw, 92px)",
		rotate: 7,
		duration: 9.1,
		delay: 1.5,
		position: { left: "3%", top: "62%" },
		className: "hidden xl:block",
	},
];

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export function FloatingStickers({
	variant,
}: {
	variant: keyof typeof stickersByVariant;
}) {
	return <StickerLayer placements={stickersByVariant[variant]} />;
}

export function ProjectStickers({ slug }: { slug: string }) {
	const names = projectStickerNames[slug] ?? projectStickerNames.default;
	const placements: StickerPlacement[] = names.map((name, index) => ({
		name,
		label: stickers[name].label,
		...(projectSlots[index] ?? projectSlots[0]),
	}));

	return <StickerLayer placements={placements} />;
}

function StickerLayer({ placements }: { placements: StickerPlacement[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<DragState | null>(null);
	const suppressClickRef = useRef(false);
	const [offsets, setOffsets] = useState<
		Partial<Record<StickerName, { x: number; y: number }>>
	>({});
	const [pops, setPops] = useState<Partial<Record<StickerName, number>>>({});
	const [dragging, setDragging] = useState<StickerName | null>(null);

	const startDrag = (
		event: ReactPointerEvent<HTMLButtonElement>,
		name: StickerName,
	) => {
		if (event.pointerType === "mouse" && event.button !== 0) return;

		const container = containerRef.current;
		if (!container) return;

		const containerRect = container.getBoundingClientRect();
		const rect = event.currentTarget.getBoundingClientRect();
		const offset = offsets[name] ?? { x: 0, y: 0 };

		suppressClickRef.current = false;
		dragRef.current = {
			name,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			baseX: offset.x,
			baseY: offset.y,
			minX: offset.x + (containerRect.left - rect.left),
			maxX: offset.x + (containerRect.right - rect.right),
			minY: offset.y + (containerRect.top - rect.top),
			maxY: offset.y + (containerRect.bottom - rect.bottom),
			moved: false,
		};

		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(name);
	};

	const moveDrag = (
		event: ReactPointerEvent<HTMLButtonElement>,
		name: StickerName,
	) => {
		const drag = dragRef.current;
		if (!drag || drag.name !== name || drag.pointerId !== event.pointerId) return;

		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;

		setOffsets((current) => ({
			...current,
			[name]: {
				x: clamp(drag.baseX + dx, drag.minX, drag.maxX),
				y: clamp(drag.baseY + dy, drag.minY, drag.maxY),
			},
		}));
	};

	const endDrag = (
		event: ReactPointerEvent<HTMLButtonElement>,
		name: StickerName,
	) => {
		const drag = dragRef.current;
		if (!drag || drag.name !== name || drag.pointerId !== event.pointerId) return;

		if (drag.moved) suppressClickRef.current = true;
		dragRef.current = null;
		setDragging(null);

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	const pop = (name: StickerName) => {
		if (suppressClickRef.current) {
			suppressClickRef.current = false;
			return;
		}
		setPops((current) => ({ ...current, [name]: (current[name] ?? 0) + 1 }));
	};

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
		>
			{placements.map((sticker) => {
				const popCount = pops[sticker.name] ?? 0;
				const offset = offsets[sticker.name] ?? { x: 0, y: 0 };
				const isDragging = dragging === sticker.name;

				return (
					<div
						key={sticker.name}
						className={`absolute ${sticker.className ?? ""}`}
						style={{
							...sticker.position,
							width: sticker.size,
							zIndex: isDragging ? 10 : undefined,
						}}
					>
						<button
							type="button"
							onPointerDown={(event) => startDrag(event, sticker.name)}
							onPointerMove={(event) => moveDrag(event, sticker.name)}
							onPointerUp={(event) => endDrag(event, sticker.name)}
							onPointerCancel={(event) => endDrag(event, sticker.name)}
							onClick={() => pop(sticker.name)}
							aria-label={`${sticker.label} sticker. Drag to move it, click to pop it.`}
							style={{
								transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${sticker.rotate}deg)`,
								touchAction: "none",
							}}
							className="group pointer-events-auto block w-full cursor-grab select-none rounded-3xl outline-none transition-[filter] duration-300 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:cursor-grabbing"
						>
							<span
								className="sticker-float block"
								style={{
									animationDuration: `${sticker.duration}s`,
									animationDelay: `${sticker.delay}s`,
									animationPlayState: isDragging ? "paused" : "running",
								}}
							>
								<span
									key={popCount}
									className={`relative block ${popCount > 0 ? "sticker-pop" : ""}`}
								>
									{popCount > 0 && (
										<span
											aria-hidden
											className="sticker-ring pointer-events-none absolute inset-2 rounded-full border-2 border-zinc-100/60"
										/>
									)}
									<img
										src={stickers[sticker.name].src}
										alt=""
										draggable={false}
										loading="lazy"
										className={`block h-auto w-full pointer-events-none transition-[filter] duration-300 ${
											isDragging
												? "drop-shadow-[0_24px_36px_rgba(0,0,0,0.7)]"
												: "drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)]"
										}`}
									/>
								</span>
							</span>
						</button>
					</div>
				);
			})}
		</div>
	);
}
