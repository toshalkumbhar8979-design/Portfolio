"use client";

import { ChevronLeft, ChevronRight, Folder, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GalleryImage = {
	src: string;
	title: string;
	caption: string;
};

const figures: Omit<GalleryImage, "src">[] = [
	{
		title: "Full-chip architecture",
		caption: "AXI4-Lite fabric, CP, VRAM, GSX, RTR, TPU and core",
	},
	{
		title: "Routed block layout",
		caption: "Standard-cell rows, clock tree and routing",
	},
	{
		title: "Command processor layout",
		caption: "Routed GDSII of the CP block",
	},
	{
		title: "DOOM reference frame",
		caption: "Reference render of the demo scene",
	},
	{
		title: "DOOM golden model",
		caption: "Independent Python render, HUD included",
	},
	{
		title: "DOOM RTL frame",
		caption: "Rasterizer output from the RTL data path",
	},
	{
		title: "RGB cube raster test",
		caption: "Color interpolation and clipping",
	},
	{
		title: "Final demo frame",
		caption: "Host-rendered output of the game loop",
	},
	{
		title: "Orbit view — frame 0",
		caption: "Camera orbit around the demo geometry",
	},
	{
		title: "Orbit view — frame 3",
		caption: "Camera orbit around the demo geometry",
	},
	{
		title: "Fly-through — frame 0",
		caption: "Camera fly-through of the demo scene",
	},
	{
		title: "Scene input — frame 0",
		caption: "Scene input for the demo loop",
	},
	{
		title: "Scene input — frame 10",
		caption: "Scene input for the demo loop",
	},
	{
		title: "Scene input — frame 24",
		caption: "Scene input for the demo loop",
	},
	{
		title: "Scene input — frame 30",
		caption: "Scene input for the demo loop",
	},
	{
		title: "MNIST inference montage",
		caption: "LeNet predictions through the RTL data path",
	},
];

const files = [
	"architecture.png",
	"gds_block.png",
	"gds_cp.png",
	"doom_ref.png",
	"doom_golden.png",
	"doom_rtl.png",
	"cube_rtl.png",
	"display_frame.png",
	"orbit_f0.png",
	"orbit_f3.png",
	"fly_f0.png",
	"input_f0.png",
	"input_f10.png",
	"input_f24.png",
	"input_f30.png",
	"mnist_montage.png",
];

const projectImages: GalleryImage[] = files.map((file, index) => ({
	...figures[index],
	src: `/projects/figures/${file}`,
}));

export const ProjectGallery = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeImage, setActiveImage] = useState<number | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen && !dialog.open) {
			dialog.showModal();
			closeButtonRef.current?.focus();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || activeImage === null) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				setActiveImage(
					(current) =>
						current === null
							? null
							: (current - 1 + projectImages.length) % projectImages.length,
				);
			}
			if (event.key === "ArrowRight") {
				setActiveImage((current) =>
					current === null ? null : (current + 1) % projectImages.length,
				);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [activeImage, isOpen]);

	const closeGallery = () => {
		setIsOpen(false);
		setActiveImage(null);
	};

	const showPreviousImage = () => {
		setActiveImage((current) =>
			current === null
				? null
				: (current - 1 + projectImages.length) % projectImages.length,
		);
	};

	const showNextImage = () => {
		setActiveImage((current) =>
			current === null ? null : (current + 1) % projectImages.length,
		);
	};

	const activeFigure = activeImage === null ? null : projectImages[activeImage];

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				aria-haspopup="dialog"
				aria-label="Open EMBER GPU gallery"
				className="flex flex-col items-center gap-2 group duration-500 hover:text-zinc-300"
			>
				<span className="p-2 border rounded-full border-zinc-500 group-hover:border-zinc-200">
					<Folder size={24} />
				</span>
				<span className="text-xs font-semibold tracking-wider uppercase">
					Gallery
				</span>
			</button>

			<dialog
				ref={dialogRef}
				onClose={closeGallery}
				onClick={(event) => {
					if (event.target === event.currentTarget) closeGallery();
				}}
				aria-labelledby="ember-gallery-title"
				className="m-auto max-h-[90vh] w-[min(92vw,72rem)] max-w-none overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-0 text-zinc-100 shadow-2xl shadow-black/60 backdrop:bg-zinc-950/85 backdrop:backdrop-blur-sm"
			>
				<div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-700 bg-zinc-900/95 px-4 py-3 backdrop-blur sm:px-6">
					<div className="min-w-0">
						<h2
							id="ember-gallery-title"
							className="truncate font-display text-sm font-semibold sm:text-base"
						>
							{activeFigure ? activeFigure.title : "EMBER GPU gallery"}
						</h2>
						<p className="mt-1 truncate text-xs uppercase tracking-wider text-zinc-400">
							{activeFigure
								? `Figure ${(activeImage ?? 0) + 1} of ${projectImages.length}`
								: `${projectImages.length} figures · architecture, silicon, renders, inference`}
						</p>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{activeFigure && (
							<>
								<button
									type="button"
									onClick={() => setActiveImage(null)}
									className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300 sm:flex"
								>
									<ChevronLeft size={16} />
									All figures
								</button>
								<a
									href={activeFigure.src}
									target="_blank"
									rel="noreferrer"
									className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
									aria-label="Open full-size figure in a new tab"
								>
									<Maximize2 size={18} />
								</a>
							</>
						)}
						<button
							ref={closeButtonRef}
							type="button"
							onClick={closeGallery}
							className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
							aria-label="Close EMBER GPU gallery"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				{activeFigure && activeImage !== null ? (
					<div className="p-4 sm:p-6">
						<div className="flex min-h-[min(55vh,32rem)] items-center justify-center gap-2 sm:gap-4">
							<button
								type="button"
								onClick={showPreviousImage}
								className="shrink-0 rounded-full border border-zinc-700 p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
								aria-label="View previous figure"
							>
								<ChevronLeft size={22} />
							</button>
							<figure className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
								<img
									src={activeFigure.src}
									alt={activeFigure.title}
									className="max-h-[58vh] w-auto max-w-full rounded-lg border border-zinc-800 bg-zinc-950 object-contain"
								/>
								<figcaption className="text-center text-sm text-zinc-400">
									{activeFigure.caption}
								</figcaption>
							</figure>
							<button
								type="button"
								onClick={showNextImage}
								className="shrink-0 rounded-full border border-zinc-700 p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
								aria-label="View next figure"
							>
								<ChevronRight size={22} />
							</button>
						</div>
						<button
							type="button"
							onClick={() => setActiveImage(null)}
							className="mx-auto mt-4 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300 sm:hidden"
						>
							<ChevronLeft size={16} />
							All figures
						</button>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
						{projectImages.map((image, index) => (
							<button
								key={image.src}
								type="button"
								onClick={() => setActiveImage(index)}
								aria-label={`View ${image.title}`}
								className="group overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 text-left transition-colors hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
							>
								<span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-zinc-900/60 p-2">
									<img
										src={image.src}
										alt=""
										loading="lazy"
										className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
									/>
									<span className="absolute left-2 top-2 rounded-sm border border-zinc-700 bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-zinc-400 backdrop-blur">
										{String(index + 1).padStart(2, "0")}
									</span>
								</span>
								<span className="block border-t border-zinc-800 px-3 py-2">
									<span className="block truncate text-xs font-medium leading-5 text-zinc-200 group-hover:text-white">
										{image.title}
									</span>
									<span className="block truncate text-[11px] leading-4 text-zinc-500">
										{image.caption}
									</span>
								</span>
							</button>
						))}
					</div>
				)}
			</dialog>
		</>
	);
};
