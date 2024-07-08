import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24" style={{backgroundColor:'white'}}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Link href="/home"  style={{textAlign:'center', fontSize:40 }}>
            <h1>Click to View Home</h1>
        </Link>
      </div>
    </main>
  );
}