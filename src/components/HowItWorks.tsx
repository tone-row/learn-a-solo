import Image from "next/image";

export function HowItWorks() {
  return (
    <div className="grid gap-6 p-6 max-w-[1460px] mx-auto md:p-10">
      <header className="grid gap-4">
        <h1 className="text-3xl font-bold">
          How It Works: Learn a Guitar Solo
        </h1>
        <p className="text-balance text-lg max-w-2xl">
          Welcome to learnasolo.com, your ultimate destination to learn guitar
          solos quickly and effectively. Our innovative platform is designed to
          help aspiring guitarists learn to guitar solo with ease.
        </p>
      </header>

      <section className="grid gap-8 mt-8">
        <h2 className="text-2xl font-bold">
          Simple Steps to Learn Guitar Solos
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="grid gap-4 p-6 border-2 border-black rounded-xl"
            >
              <div className="grid gap-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-neutral-600">{step.description}</p>
              </div>
              <div className="aspect-video bg-neutral-100 rounded-lg border border-black/50 overflow-hidden shadow-sm">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover object-center object-top"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 mt-8">
        <h2 className="text-2xl font-bold">Why Learn Guitar Solos with Us?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="grid gap-2 p-6 border-2 border-black rounded-xl"
            >
              <h3 className="text-xl font-semibold">{benefit.title}</h3>
              <p className="text-neutral-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 mt-8 p-6 bg-neutral-100 rounded-xl">
        <p className="text-balance text-lg">
          Remember, consistent practice is key to improving your guitar solo
          skills. With learnasolo.com, you have a powerful tool at your disposal
          to make every practice session count.
        </p>
        <p className="text-balance text-lg font-semibold">
          Start your journey to learn guitar solos today and unlock your full
          potential as a guitarist!
        </p>
      </section>
    </div>
  );
}

const steps = [
  {
    title: "Find Your Solo",
    description:
      "Locate a YouTube video featuring the guitar solo you want to learn. Our platform works with any YouTube video, giving you access to an endless library of solos.",
    image: "/youtube.png",
  },
  {
    title: "Enter the Video URL",
    description:
      "Copy the YouTube URL of your chosen solo and paste it into our practice page. This brings the guitar solo right into our specialized learning environment.",
    image: "/url.png",
  },
  {
    title: "Set Your Loop",
    description:
      "Use our unique slider tool to pinpoint the exact section of the solo you want to practice. Focus on specific phrases or techniques as you learn.",
    image: "/loop.png",
  },
  {
    title: "Fine-tune Your Practice",
    description:
      "Access our advanced practice interface with speed control, seamless looping, and convenient keyboard shortcuts to enhance your learning experience.",
    image: "/practice.png",
  },
];

const benefits = [
  {
    title: "Accessibility",
    description:
      "Access virtually any guitar solo ever recorded on YouTube. From classic rock to modern metal, jazz to blues, learn any style.",
  },
  {
    title: "Precision Learning",
    description:
      "Isolate and repeat specific sections of a solo without constantly rewinding and searching for the right spot.",
  },
  {
    title: "Customizable Speed",
    description:
      "Slow down solos without changing pitch, then gradually increase the speed until you can play along with the original tempo.",
  },
  {
    title: "Progress Tracking",
    description:
      "Keep track of the solos you've practiced and return to them for further refinement as you continue to learn.",
  },
];
