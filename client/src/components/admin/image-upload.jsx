
import React, { useEffect, useRef } from 'react'
import { Input } from '../ui/input'
import { FileIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import api from '@/lib/api'
import { useToast } from "@/hooks/use-toast";

export default function ProductImageUpload({ imageFile, setImageFile, uploadedImageUrl, setUploadedImageUrl, imageLoad, setImageLoad, isEdit, setFormData, formData }) {
    const { toast } = useToast();
    const inputRef = useRef(null);
    const handleImageChange = (e) => {
        try {
            console.log("Image File : ", e.target.files)
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {

                setImageFile(selectedFile)
            }

        } catch (error) {
            console.log(error);
        }
    }
    const handleDragOver = (e) => {
        try {
            e.preventDefault();

        } catch (error) {
            console.log(error);
        }

    }
    const handleDrop = (e) => {
        try {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
                setImageFile(droppedFile)
            }

        } catch (error) {
            console.log(error);
        }

    }
    const handleRemoveImage = () => {
        setImageFile(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    // Hotspot editor state
    const [editingHotspot, setEditingHotspot] = React.useState(null); // {xPercent,yPercent, index}
    // Show an inline prompt right after successful upload asking admin if they'd like to add hotspots
    const [showAddHotspotsPrompt, setShowAddHotspotsPrompt] = React.useState(false);
    // When true, image clicks will immediately start adding hotspots (mode active)
    const [hotspotModeActive, setHotspotModeActive] = React.useState(false);

    const imageContainerRef = React.useRef(null);

    // Click handler to add hotspot
    // Accept either the formData.image (explicitly set) or `uploadedImageUrl` (upload-only state) so admin can click
    // immediately after upload even if formData.image hasn't been updated yet.
    const handleImageClick = (e) => {
        try {
            // ensure we have an uploaded image URL or formData.image
            const imgSrc = formData?.image || uploadedImageUrl || null;
            if (!imgSrc) return;

            const rect = imageContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = Math.round((x / rect.width) * 10000) / 100; // two decimals
            const yPercent = Math.round((y / rect.height) * 10000) / 100;

            setEditingHotspot({ xPercent, yPercent, index: null, name: '', nodeName: '', price: 0, quantity: 0, thumbnail: '', description: '' });
        } catch (err) {
            console.log(err);
        }
    }

    const saveHotspot = () => {
        try {
            const parts = formData.parts ? [...formData.parts] : [];
            const input = { name: editingHotspot.name, nodeName: editingHotspot.nodeName, description: editingHotspot.description, price: Number(editingHotspot.price || 0), quantity: Number(editingHotspot.quantity || 0), thumbnail: editingHotspot.thumbnail, xPercent: Number(editingHotspot.xPercent), yPercent: Number(editingHotspot.yPercent) };
            if (editingHotspot.index !== null) {
                parts[editingHotspot.index] = input;
            } else {
                parts.push(input);
            }
            setFormData(prev => ({ ...prev, parts }));
            setEditingHotspot(null);
        } catch (err) { console.log(err) }
    }

    const removeHotspotAt = (idx) => {
        const parts = formData.parts ? [...formData.parts] : [];
        parts.splice(idx, 1);
        setFormData(prev => ({ ...prev, parts }));
    }



    // Image Load
    useEffect(() => {

        const uploadImageToCloudinary = async () => {
            try {
                setImageLoad(true);
                const data = new FormData();
                data.append("my_file", imageFile);
                const response = await api.post(`/admin/products/upload-image`, data);
                console.log("Response : ", response.data);
                if (response.data?.success) {
                    const url = response.data?.result?.url;
                    setUploadedImageUrl(url);
                    // use functional update to avoid depending on the outer `formData` value
                    setFormData(prev => ({ ...prev, image: response.data?.result?.url }))
                    // After successful upload, ask the admin if they want to add hotspots now (inline editor)
                    // this gives an immediate admin experience without relying on the builder new-tab.
                    setShowAddHotspotsPrompt(true);

                    // Open editor in new tab: pass imageUrl (encoded) and quickSave mode
                    try {
                        // Open builder in a new tab and send imageUrl via postMessage (avoids long/data URLs in query string)
                        const builderUrl = `/tools/product-builder.html?quickSave=1&fromAdmin=1`;
                        // Persist image URL in localStorage (shared across same-origin tabs) so the builder can load reliably
                        try {
                            localStorage.setItem('productBuilder_image', url);
                        } catch (e) {
                            console.log('Failed to set productBuilder_image in localStorage', e);
                        }

                        const win = window.open(builderUrl, '_blank');
                        // Try to postMessage after a short delay so the target window can attach a listener (best-effort)
                        setTimeout(() => {
                            try {
                                if (win && !win.closed) {
                                    win.postMessage({ type: 'product-builder:loadImage', imageUrl: url }, '*');
                                }
                            } catch (e) {
                                console.log('Failed to postMessage to product builder', e);
                            }
                        }, 500);
                    } catch (e) { console.log('Failed to open builder tab', e); }
                }
                else {
                    toast({
                        title: "Error Occured While Uploading Image",
                        variant: "destructive"
                    })
                }

            } catch (error) {
                console.log(error);
            }
            finally {
                setImageLoad(false);
            }
        }

        if (imageFile != null) {
            uploadImageToCloudinary();
        }

    }, [imageFile, setImageLoad, setUploadedImageUrl, setFormData, toast])


    return (
        <div className='w-full max-w-md mx-auto mt-5'>
            <label className='text-md font-semibold block '>
                Upload Image
            </label>
            <div onDragOver={handleDragOver} onDrop={handleDrop} className={`${isEdit ? 'opacity-60' : ""}  border-2 border-dashed rounded-lg p-4 mt-2`}>
                <Input id="Image-Upload" type="file" className="hidden" ref={inputRef} onChange={handleImageChange} disabled={isEdit} />
                {
                    (() => {
                        // construct the upload area content in a clearer if/else form to avoid JSX nesting problems
                        if (!imageFile) {
                            return (
                                <label
                                    htmlFor="Image-Upload"
                                    className={`${isEdit ? 'cursor-not-allowed' : ''} flex flex-col items-center justify-center cursor-pointer`}
                                >
                                    <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
                                    <span className="text-xs">Drag & Drop or Click to Upload an Image</span>
                                </label>
                            );
                        }

                        if (imageLoad) {
                            return (
                                <div className='flex items-center justify-center'>
                                    <span className='text-xs'>Please Wait Image is Uploading</span>
                                </div>
                            );
                        }

                        // default (imageFile and not loading): show preview + hotspot editor
                        return (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className='flex items-center'>
                                        <FileIcon className='w-8 h-8 text-primary me-2' />
                                    </div>
                                    <p className='text-sm'>{imageFile.name}</p>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleRemoveImage}>
                                        <XIcon className='w-4 h-4' />
                                        <span className='sr-only'>Remove File</span>
                                    </Button>
                                </div>

                                {/* Image preview + hotspot editor */}
                                {(formData?.image || (uploadedImageUrl && uploadedImageUrl !== '')) && (
                                    <div className="mt-4 p-4 border rounded bg-white">
                                        <div className="mb-2 font-semibold">Image preview & hotspot editor</div>
                                        {/* Hotspot mode toggle - makes it obvious admin can click to add hotspots */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm">Click image to add hotspots (parts)</div>
                                            <div className="text-xs text-muted-foreground">Hotspot mode: <strong className='ml-2'>{hotspotModeActive ? 'Active' : (editingHotspot ? 'Editing' : 'Click to add')}</strong></div>
                                        </div>

                                        <div style={{ position: 'relative' }}>
                                            {/* After upload prompt: ask admin whether they'd like to add hotspots now */}
                                            {showAddHotspotsPrompt && (
                                                <div style={{ position: 'absolute', left: 10, top: 10, zIndex: 50, background: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                                                    <div style={{ fontWeight: 700 }}>Add hotspots now?</div>
                                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Click the image to add part hotspots (name, price, thumbnail, description).</div>
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                        <button onClick={() => { setHotspotModeActive(true); setShowAddHotspotsPrompt(false); }} style={{ background: '#0ea5e9', color: '#fff', padding: '6px 8px', borderRadius: 6 }}>Yes — Add hotspots</button>
                                                        <button onClick={() => { setShowAddHotspotsPrompt(false); }} style={{ padding: '6px 8px', borderRadius: 6 }}>Skip</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="relative border rounded overflow-hidden" style={{ width: '100%', maxWidth: 480 }} ref={imageContainerRef} onClick={handleImageClick}>
                                                <img src={formData?.image || uploadedImageUrl} alt="product" style={{ display: 'block', width: '100%' }} />

                                                {/* small helper: make it explicit for admins to copy the uploaded URL into formData (ensures validation won't mark Image missing) */}
                                                {uploadedImageUrl && (!formData?.image || `${formData.image}`.trim() === '') && (
                                                    <div style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 60 }}>
                                                        <button onClick={(ev) => { ev.stopPropagation(); setFormData(prev => ({ ...prev, image: uploadedImageUrl })); }} style={{ background: '#111827', color: '#fff', padding: '6px 8px', borderRadius: 6, opacity: 0.95 }}>Use uploaded image</button>
                                                    </div>
                                                )}

                                                {/* render existing hotspots */}
                                                {formData?.parts && formData.parts.length > 0 && formData.parts.map((p, idx) => (
                                                    p.xPercent !== undefined && p.yPercent !== undefined ? (
                                                        <div key={idx} style={{ position: 'absolute', left: `${p.xPercent}%`, top: `${p.yPercent}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                                                            <button onClick={(ev) => { ev.stopPropagation(); setEditingHotspot({ ...p, index: idx }); }} className="rounded-full w-8 h-8 bg-primary text-white flex items-center justify-center border-2 border-white shadow-xl">+</button>
                                                            <div style={{ position: 'absolute', top: '32px', left: '-50px', width: 160, background: '#0b1220', color: '#fff', padding: 6, borderRadius: 6, boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }}>
                                                                <div style={{ fontWeight: 700 }}>{p.name}</div>
                                                                <div style={{ fontSize: 12, opacity: 0.9 }}>{p.description}</div>
                                                                <div style={{ fontSize: 12, marginTop: 4 }}> ${p.price?.toFixed(2) || '0.00'}</div>
                                                                <div style={{ marginTop: 6 }}><button className="text-xs" onClick={(e) => { e.stopPropagation(); removeHotspotAt(idx); }}>Remove</button></div>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                ))}

                                            </div>

                                            {/* inline editor */}
                                            {editingHotspot && (
                                                <div className="mt-3 p-3 border rounded bg-slate-50">
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        <div style={{ fontWeight: 700 }}>Hotspot at {editingHotspot.xPercent}% , {editingHotspot.yPercent}%</div>
                                                        <button onClick={() => setEditingHotspot(null)} className="ml-auto text-xs text-muted">Cancel</button>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                                        <input placeholder='Part name' value={editingHotspot.name} onChange={(e) => setEditingHotspot({ ...editingHotspot, name: e.target.value })} />
                                                        <input placeholder='nodeName' value={editingHotspot.nodeName} onChange={(e) => setEditingHotspot({ ...editingHotspot, nodeName: e.target.value })} />
                                                        <input placeholder='price' type="number" value={editingHotspot.price} onChange={(e) => setEditingHotspot({ ...editingHotspot, price: e.target.value })} />
                                                        <input placeholder='quantity' type="number" value={editingHotspot.quantity} onChange={(e) => setEditingHotspot({ ...editingHotspot, quantity: e.target.value })} />
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-semibold">Thumbnail</label>
                                                            <div className="flex gap-2 items-center">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            try {
                                                                                const data = new FormData();
                                                                                data.append("my_file", file);
                                                                                const response = await api.post(`/admin/products/upload-image`, data);
                                                                                if (response.data?.success) {
                                                                                    setEditingHotspot({ ...editingHotspot, thumbnail: response.data.result.url });
                                                                                    toast({ title: "Part image uploaded" });
                                                                                }
                                                                            } catch (error) {
                                                                                console.error(error);
                                                                                toast({ title: "Upload failed", variant: "destructive" });
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                {editingHotspot.thumbnail && (
                                                                    <img src={editingHotspot.thumbnail} alt="Part" className="w-10 h-10 object-cover rounded border" />
                                                                )}
                                                            </div>
                                                            <Input
                                                                placeholder='Or enter URL'
                                                                value={editingHotspot.thumbnail}
                                                                onChange={(e) => setEditingHotspot({ ...editingHotspot, thumbnail: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <textarea placeholder='description' className='mt-2' value={editingHotspot.description} onChange={(e) => setEditingHotspot({ ...editingHotspot, description: e.target.value })} />
                                                    <div className='mt-2 flex gap-2'>
                                                        <Button onClick={saveHotspot} className="w-full">Save Hotspot</Button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()
                }

            </div>
        </div>
    )
}
