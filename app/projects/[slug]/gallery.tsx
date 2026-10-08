"use client";

import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight, Folder, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GalleryImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
};

const projectImages: GalleryImage[] = [
	{ src: "architecture.png", alt: "EMBER GPU architecture diagram", width: 2048, height: 1316 },
	{ src: "cube_rtl.png", alt: "RTL cube render", width: 320, height: 240 },
	{ src: "die_shot.png", alt: "GPU die layout", width: 640, height: 640 },
	{ src: "display_frame.png", alt: "Rendered graphics demo frame", width: 1280, height: 960 },
	{ src: "fly_f0.png", alt: "Temple fly-through, frame 0", width: 640, height: 480 },
	{ src: "gds_block.png", alt: "Routed GDS block layout", width: 700, height: 700 },
	{ src: "gds_cp.png", alt: "Routed command processor GDS layout", width: 700, height: 700 },
	{ src: "input_f0.png", alt: "Graphics input, frame 0", width: 640, height: 240 },
	{ src: "input_f10.png", alt: "Graphics input, frame 10", width: 640, height: 240 },
	{ src: "input_f24.png", alt: "Graphics input, frame 24", width: 640, height: 240 },
	{ src: "input_f30.png", alt: "Graphics input, frame 30", width: 640, height: 240 },
	{ src: "mnist_montage.png", alt: "MNIST digit inference montage", width: 1252, height: 165 },
	{ src: "orbit_f0.png", alt: "Orbit demo, frame 0", width: 640, height: 480 },
	{ src: "orbit_f3.png", alt: "Orbit demo, frame 3", width: 640, height: 480 },
].map((image) => ({
	...image,
	src: `/projects/ember-gpu/gallery/${image.src}`,
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
		if (!isOpen || activeImage === null || projectImages.length < 2) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				setActiveImage((current) =>
					current === null ? null : (current - 1 + projectImages.length) % projectImages.length,
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

	const showPreviousImage = () => {
		setActiveImage((current) =>
			current === null ? null : (current - 1 + projectImages.length) % projectImages.length,
		);
	};

	const showNextImage = () => {
		setActiveImage((current) => (current === null ? null : (current + 1) % projectImages.length));
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="flex flex-col items-center gap-2 group duration-500 hover:text-zinc-300"
				aria-haspopup="dialog"
				aria-label="Open EMBER GPU gallery"
			>
				<span className="p-2 border rounded-full border-zinc-500 group-hover:border-zinc-200">
					<Folder size={24} />
				</span>
				<span className="text-xs font-semibold tracking-wider uppercase">Gallery</span>
			</button>

			<dialog
				ref={dialogRef}
				onClose={() => setIsOpen(false)}
				onClick={(event) => {
					if (event.target === event.currentTarget) setIsOpen(false);
				}}
				className="m-auto max-h-[90vh] w-[min(92vw,72rem)] max-w-none overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-0 text-zinc-100 backdrop:bg-zinc-950/85 backdrop:backdrop-blur-sm"
				aria-labelledby="ember-gallery-title"
			>
				<div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3 sm:px-6">
					<div>
						<h2 id="ember-gallery-title" className="font-display text-base font-semibold sm:text-lg">
							{activeImage === null ? "EMBER GPU" : projectImages[activeImage].alt}
						</h2>
						<p className="mt-1 text-xs text-zinc-400">
							{activeImage === null
								? `${projectImages.length} project images`
								: `Image ${activeImage + 1} of ${projectImages.length}`}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{activeImage !== null && (
							<button
								type="button"
								onClick={() => setActiveImage(null)}
								className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
							>
								<ArrowLeft size={18} />
								<span>All images</span>
							</button>
						)}
						<button
							ref={closeButtonRef}
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
							aria-label="Close EMBER GPU gallery"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				{activeImage === null ? (
					<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
						{projectImages.map((image, index) => (
							<button
								key={image.src}
								type="button"
								onClick={() => setActiveImage(index)}
								className="group overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 text-left transition-colors hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
								aria-label={`View ${image.alt}`}
							>
								<span className="flex aspect-[4/3] items-center justify-center overflow-hidden p-2">
									<Image
										src={image.src}
										alt=""
										width={image.width}
										height={image.height}
										unoptimized
										className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
									/>
								</span>
								<span className="block border-t border-zinc-800 px-3 py-2 text-xs leading-5 text-zinc-300 group-hover:text-white">
									{image.alt}
								</span>
							</button>
						))}
					</div>
				) : (
					<div className="p-4 sm:p-6">
						<div className="flex min-h-[min(60vh,36rem)] items-center justify-center gap-3">
							{projectImages.length > 1 && (
								<button
									type="button"
									onClick={showPreviousImage}
									className="shrink-0 rounded-full border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
									aria-label="View previous image"
								>
									<ChevronLeft size={22} />
								</button>
							)}
							<figure className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3">
								<Image
									src={projectImages[activeImage].src}
									alt={projectImages[activeImage].alt}
									width={projectImages[activeImage].width}
									height={projectImages[activeImage].height}
									unoptimized
									priority
									className="max-h-[60vh] w-auto max-w-full object-contain"
								/>
								<figcaption className="text-center text-sm text-zinc-400">
									{projectImages[activeImage].alt}
								</figcaption>
							</figure>
							{projectImages.length > 1 && (
								<button
									type="button"
									onClick={showNextImage}
									className="shrink-0 rounded-full border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
									aria-label="View next image"
								>
									<ChevronRight size={22} />
								</button>
							)}
						</div>
					</div>
				)}
			</dialog>
		</>
	);
};
