from PIL import Image, ImageDraw, ImageFont
import urllib.request, os

W,H=1200,630
CREAM=(246,243,234); GOLD=(139,115,53); GOLD_SOFT=(185,162,95)
CHARCOAL=(43,40,35); MUTED=(111,104,92)

os.makedirs("fonts",exist_ok=True)
fonts={
 "CormorantGaramond.ttf":"https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf",
 "Montserrat.ttf":"https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf",
}
for fn,url in fonts.items():
    p=os.path.join("fonts",fn)
    if not os.path.exists(p): urllib.request.urlretrieve(url,p)

def f(name,size,wght=None):
    ft=ImageFont.truetype(os.path.join("fonts",name),size)
    if wght is not None:
        try: ft.set_variation_by_axes([wght])
        except: pass
    return ft

corm="CormorantGaramond.ttf"; mont="Montserrat.ttf"
img=Image.new("RGB",(W,H),CREAM); d=ImageDraw.Draw(img)
eyebrow_f=f(mont,30,600); brand_f=f(corm,168,600); tag_f=f(corm,50,500); url_f=f(mont,30,500)

def center(y,text,font,fill,track=0):
    if track==0:
        w=d.textlength(text,font=font); d.text(((W-w)/2,y),text,font=font,fill=fill); return
    ws=[d.textlength(c,font=font) for c in text]; total=sum(ws)+track*(len(text)-1); x=(W-total)/2
    for c,cw in zip(text,ws): d.text((x,y),c,font=font,fill=fill); x+=cw+track

d.rectangle([24,24,W-25,H-25],outline=GOLD_SOFT,width=2)
center(150,"PERSONALIZED PEPTIDE PROTOCOL",eyebrow_f,GOLD,8)
b1,b2="Bio","Linked"; w1=d.textlength(b1,font=brand_f); w2=d.textlength(b2,font=brand_f)
bx=(W-(w1+w2))/2; by=215
d.text((bx,by),b1,font=brand_f,fill=CHARCOAL); d.text((bx+w1,by),b2,font=brand_f,fill=GOLD)
ry=by+195; d.line([(W/2-70),ry,(W/2+70),ry],fill=GOLD,width=3)
center(ry+28,"Clinical Peptide & Hormone Optimization",tag_f,MUTED)
center(H-92,"biolinkedsolutions.com",url_f,GOLD,2)
img.save("og-image.png","PNG"); print("saved", img.size)
