import { Button } from '@/components/ui/button';
import {
  ADD_AUDIO,
  ADD_IMAGE,
  ADD_TEXT,
  ADD_VIDEO,
  dispatcher,
} from '@designcombo/core';
import { nanoid } from 'nanoid';
import { IMAGES } from '@/data/images';
import { DEFAULT_FONT } from '@/data/fonts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadIcon } from 'lucide-react';

export const Uploads = () => {
  const handleAddImage = () => {
    dispatcher?.dispatch(ADD_IMAGE, {
      payload: {
        id: nanoid(),
        details: {
          src: IMAGES[4].src,
        },
      },
      options: {
        trackId: 'main',
      },
    });
  };

  const handleAddText = () => {
    dispatcher?.dispatch(ADD_TEXT, {
      payload: {
        id: nanoid(),
        details: {
          text: 'Heading',
          fontSize: 200,
          width: 900,
          fontUrl: DEFAULT_FONT.url,
          fontFamily: DEFAULT_FONT.postScriptName,
          color: '#ffffff',
          WebkitTextStrokeColor: 'green',
          WebkitTextStrokeWidth: '20px',
          textShadow: '30px 30px 100px rgba(255, 255, 0, 1)',
          wordWrap: 'break-word',
          wordBreak: 'break-all',
        },
      },
      options: {},
    });
  };

  const handleAddAudio = () => {
    dispatcher?.dispatch(ADD_AUDIO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/timer-voice.mp3',
        },
      },
      options: {},
    });
  };

  const handleAddVideo = () => {
    dispatcher?.dispatch(ADD_VIDEO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/75475-556034323_medium.mp4',
        },
        metadata: {
          resourceId: '7415538a-5d61-4a81-ad79-c00689b6cc10',
        },
      },
      options: {
        trackId: 'main',
      },
    });
  };

  const handleAddVideo2 = () => {
    dispatcher?.dispatch(ADD_VIDEO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/flat.mp4',
        },
        metadata: {
          resourceId: '7415538a-5do1-4m81-a279-c00689b6cc10',
        },
      },
    });
  };

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        
        // Dispatch actions to load the template data
        if (template.trackItemIds) {
          template.trackItemIds.forEach((itemId: string) => {
            const item = template.trackItemsMap[itemId];
            switch (item.type) {
              case 'video':
                dispatcher?.dispatch(ADD_VIDEO, {
                  payload: {
                    id: itemId,
                    details: item.details,
                    metadata: item.metadata,
                  },
                  options: {
                    trackId: item.isMain ? 'main' : undefined,
                  },
                });
                break;
              case 'audio':
                dispatcher?.dispatch(ADD_AUDIO, {
                  payload: {
                    id: itemId,
                    details: item.details,
                  },
                  options: {},
                });
                break;
              case 'image':
                dispatcher?.dispatch(ADD_IMAGE, {
                  payload: {
                    id: itemId,
                    details: item.details,
                  },
                  options: {
                    trackId: item.isMain ? 'main' : undefined,
                  },
                });
                break;
              case 'text':
                dispatcher?.dispatch(ADD_TEXT, {
                  payload: {
                    id: itemId,
                    details: item.details,
                  },
                  options: {},
                });
                break;
            }
          });
        }
      } catch (error) {
        console.error('Error parsing template:', error);
      }
    };
    reader.readAsText(file);
  };

  interface ShotstackClip {
    fit?: string;
    offset?: { x: number; y: number };
    start: number;
    length: number;
    scale?: number;
    position?: string;
    effect?: string;
    asset: {
      type: string;
      src?: string;
      text?: string;
      width?: number;
      height?: number;
      volume?: number;
      font?: {
        family?: string;
        color?: string;
        size?: number;
      };
      alignment?: {
        horizontal?: string;
        vertical?: string;
      };
    };
    transition?: {
      in?: string;
      out?: string;
    };
  }
  
  const handleShotstackTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        const trackItems: string[] = [];
        const trackItemsMap: Record<string, any> = {};
        const tracksByType: Record<string, string[]> = {
          text: [],
          main: [],
          audio: [],
        };
  
        template.timeline.tracks.forEach((track: { clips: ShotstackClip[] }) => {
          track.clips.forEach((clip: ShotstackClip) => {
            const id = nanoid();
            trackItems.push(id);
  
            const baseItem = {
              id,
              name: '',
              display: {
                from: clip.start * 1000,
                to: (clip.start + clip.length) * 1000,
              },
              transform: {
                position: clip.position || 'center',
                scale: clip.scale || 1,
                offset: clip.offset || { x: 0, y: 0 },
                fit: clip.fit || 'cover',
              },
              transition: clip.transition || null,
              effect: clip.effect || null,
            };
  
            switch (clip.asset.type) {
              case 'video':
                trackItemsMap[id] = {
                  ...baseItem,
                  type: 'video',
                  details: {
                    src: clip.asset.src,
                    duration: clip.length * 1000,
                    volume: clip.asset.volume || 100,
                    opacity: 100,
                  },
                  metadata: {},
                  isMain: true,
                };
                tracksByType.main.push(id);
                break;
  
              case 'text':
                trackItemsMap[id] = {
                  ...baseItem,
                  type: 'text',
                  details: {
                    text: clip.asset.text,
                    fontFamily: clip.asset.font?.family || 'Roboto-Bold',
                    fontSize: clip.asset.font?.size || 120,
                    color: clip.asset.font?.color || '#ffffff',
                    width: clip.asset.width || 600,
                    height: clip.asset.height,
                    alignment: clip.asset.alignment || {
                      horizontal: 'center',
                      vertical: 'center',
                    },
                  },
                  metadata: {},
                  isMain: false,
                };
                tracksByType.text.push(id);
                break;
  
              case 'audio':
                trackItemsMap[id] = {
                  ...baseItem,
                  type: 'audio',
                  details: {
                    src: clip.asset.src,
                    volume: clip.asset.volume || 1,
                    effect: clip.asset.effect,
                    duration: clip.length * 1000,
                  },
                  metadata: {},
                  isMain: false,
                };
                tracksByType.audio.push(id);
                break;
  
              case 'image':
                trackItemsMap[id] = {
                  ...baseItem,
                  type: 'image',
                  details: {
                    src: clip.asset.src,
                    opacity: 100,
                    width: clip.asset.width,
                    height: clip.asset.height,
                  },
                  metadata: {},
                  isMain: true,
                };
                tracksByType.main.push(id);
                break;
            }
          });
        });
  
        // Create tracks structure
        const tracks = [
          {
            id: 'text-track',
            type: 'text',
            items: tracksByType.text,
            accepts: ['text'],
          },
          {
            id: 'main',
            type: 'main',
            items: tracksByType.main,
            accepts: ['video', 'image'],
          },
          {
            id: 'audio-track',
            type: 'audio',
            items: tracksByType.audio,
            accepts: ['audio'],
          },
        ];
  
        // Dispatch actions to load the converted template
        trackItems.forEach((itemId) => {
          const item = trackItemsMap[itemId];
          const trackId = item.isMain ? 'main' : undefined;
  
          switch (item.type) {
            case 'video':
              dispatcher?.dispatch(ADD_VIDEO, {
                payload: {
                  id: itemId,
                  details: item.details,
                  metadata: item.metadata,
                  transform: item.transform,
                  transition: item.transition,
                  effect: item.effect,
                },
                options: { trackId },
              });
              break;
  
            case 'text':
              dispatcher?.dispatch(ADD_TEXT, {
                payload: {
                  id: itemId,
                  details: item.details,
                  transform: item.transform,
                  transition: item.transition,
                  effect: item.effect,
                },
                options: {},
              });
              break;
  
            case 'image':
              dispatcher?.dispatch(ADD_IMAGE, {
                payload: {
                  id: itemId,
                  details: item.details,
                  transform: item.transform,
                  transition: item.transition,
                  effect: item.effect,
                },
                options: { trackId },
              });
              break;
  
            case 'audio':
              dispatcher?.dispatch(ADD_AUDIO, {
                payload: {
                  id: itemId,
                  details: item.details,
                  transition: item.transition,
                  effect: item.effect,
                },
                options: {},
              });
              break;
          }
        });
  
      } catch (error) {
        console.error('Failed to parse template:', error);
      }
    };
  
    reader.readAsText(file);
  };

  return (
    <div className="flex-1">
      <div className="text-md text-text-primary font-medium h-12  flex items-center px-4">
        Your media
      </div>
      <div className="px-4">
        <div>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">Project</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAddAudio}
                  className="flex gap-2 w-full"
                  size="sm"
                  variant="secondary"
                >
                  <UploadIcon size={16} /> Upload Media
                </Button>
                
                <Button
                  onClick={() => document.getElementById('templateInput').click()}
                  className="flex gap-2 w-full"
                  size="sm"
                  variant="secondary"
                >
                  <UploadIcon size={16} /> Import Template
                </Button>
                
                <input
                  id="templateInput"
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={handleTemplateUpload}
                />
                
                <Button
                  onClick={() => document.getElementById('shotstackTemplateInput').click()}
                  className="flex gap-2 w-full"
                  size="sm"
                  variant="secondary"
                >
                  <UploadIcon size={16} /> Import Shotstack Template
                </Button>
                
                <input
                  id="shotstackTemplateInput"
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={handleShotstackTemplateUpload}
                />
              </div>
              <div></div>
            </TabsContent>
            <TabsContent value="workspace">
              <Button
                className="flex gap-2 w-full"
                size="sm"
                variant="secondary"
              >
                <UploadIcon size={16} /> Upload
              </Button>
              <div>Some assets</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
