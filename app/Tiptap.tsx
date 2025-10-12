'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'



const Tiptap = () => {
    const editor = useEditor({
// bind Tiptap to the `.element`
        element: document.querySelector('.element'),
        // register extensions
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: '<p>Hello World! 🌎️</p>',
        editable: true,
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
    })

    return (<div className="element w-2xl max-w-full bg-amber-50 text-black p-6">
        <EditorContent editor={editor}/>
    </div>)
}

export default Tiptap