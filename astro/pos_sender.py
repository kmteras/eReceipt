import os, time
import http.client
import json
import datetime

path_to_watch = "./resipt.txt"

linec = 0
with open(path_to_watch, 'r', encoding="utf-8") as f:
    for line in f:
        linec += 1


while 1:
    time.sleep (1)
    delta = []
    with open(path_to_watch, 'r', encoding="utf-8") as f:
        curlines = 0
        for line in f:
            curlines += 1
            if curlines <= linec:
                continue
            delta.append(line)
            linec += 1

    if delta:
        kaartline = -1
        dashline = -1
        seconddashline = -1
        thirddashline = -1
        for i in range(0, len(delta)):
            line = delta[i]
            if "KAART" in line:
                kaartline = i
            if "-----" in line:
                if dashline == -1:
                    dashline = i
                    continue
                if seconddashline == -1:
                    seconddashline = i
                    continue
                if thirddashline == -1:
                    thirddashline = i
                    continue
        user = delta[kaartline].split("_")[1].strip().strip("*") + "_"  + delta[kaartline + 1].strip(" ").strip("*").replace(" ", "_")
        print(user)
        items = []
        total = 0
        for i in range(seconddashline + 1, thirddashline):
            splitted = list(filter(lambda s: s!='', delta[i].split(" ")))
            item_name = splitted[0]
            item_cost = float(splitted[1].replace(",", "."))
            item_amount = float(splitted[3])
            total += item_cost * item_amount
            item = {"name": item_name, "amount": item_amount, "price_per": item_cost}
            items.append(item)

        request = {"store": "Nemo Doom", "total": total, "date": datetime.datetime.now(), "items": items}
        conn = http.client.HTTPConnection("ereceipt.website")
        req_json = json.dumps(request, default=str)
        print(req_json)
        conn.request("POST", "/api/receipt/", req_json, {"Content-Type": "application/json"})
