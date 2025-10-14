import {SimpleEditor} from "@/components/tiptap-templates/simple/simple-editor";

export default function Home() {
    return (
        <div className="flex flex-col gap-20 p-6">
            <main className="flex flex-col gap-[32px] row-start-2 items-center">
                <SimpleEditor/>
            </main>
        </div>
    );
}
