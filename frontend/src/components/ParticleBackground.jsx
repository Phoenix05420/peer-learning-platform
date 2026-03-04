import { useCallback, useMemo, useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = useMemo(() => ({
        background: {
            color: { value: "transparent" },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: "grab" },
            },
            modes: {
                grab: { distance: 140, links: { opacity: 0.5 } }
            }
        },
        particles: {
            color: { value: "#FFB74D" },
            links: {
                color: "#FF6F00",
                distance: 120,
                enable: true,
                opacity: 0.4,
                width: 1.5,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 1.5,
                straight: false,
            },
            number: {
                density: { enable: true, area: 800 },
                value: 80,
            },
            opacity: { value: 0.6 },
            shape: { type: "circle" },
            size: { value: { min: 1.5, max: 4 } },
        },
        detectRetina: true,
    }), []);

    if (!init) return null;

    return (
        <Particles id="tsparticles" options={options} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
    );
}
