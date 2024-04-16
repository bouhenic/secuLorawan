from scapy.all import sniff, UDP, IP
import json
import binascii
import base64
import yaml
import socket

def load_config_from_yaml(file_path='config.yaml'):
    with open(file_path, 'r') as file:
        data = yaml.safe_load(file)
        return data['devAddr'], data['ipDst']


def send_data_via_socket(data):
    host = 'localhost'
    port = 12345
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        # Convertir la chaîne hexadécimale en bytes avant l'envoi
        data_bytes = bytes.fromhex(data)
        s.sendto(data_bytes, (host, port))
    print(f"Data sent: {data}")


def try_extract_json_from_hex(hex_payload, expected_dev_addr):
    try:
        start = hex_payload.find('7b')  # '{' en hexadécimal
        end = hex_payload.rfind('7d') + 2  # '}' en hexadécimal
        if start != -1 and end != -1:
            json_bytes = binascii.unhexlify(hex_payload[start:end])
            json_string = json_bytes.decode('utf-8')
            json_data = json.loads(json_string)
            if 'rxpk' in json_data:
                for packet in json_data['rxpk']:
                    if 'data' in packet:
                        base64_data = packet['data']
                        binary_data = base64.b64decode(base64_data)
                        packet_hex_data = binary_data.hex()
                        dev_addr = packet_hex_data[2:10]
                        dev_addr_reversed = ''.join(reversed([dev_addr[i:i+2] for i in range(0, len(dev_addr), 2)]))
                        if dev_addr_reversed == expected_dev_addr:
                            send_data_via_socket(packet_hex_data)  # Envoyer les données via socket UDP
    except UnicodeDecodeError as e:
        print("Erreur de décodage UTF-8 :", str(e))
    except json.JSONDecodeError as e:
        print("Erreur d'analyse JSON :", str(e))

def process_packet(packet, expected_dev_addr, ip_dst):
    if IP in packet and UDP in packet and packet[IP].dst == ip_dst:
        payload = packet[UDP].payload.load
        hex_payload = payload.hex()
        try_extract_json_from_hex(hex_payload, expected_dev_addr)

# Charger le devAddr et ipDst depuis le fichier YAML
expected_dev_addr, ip_dst = load_config_from_yaml()

# Démarrer la capture avec le devAddr chargé et l'adresse IP de destination
sniff(filter=f"udp and dst host {ip_dst}", prn=lambda x: process_packet(x, expected_dev_addr, ip_dst))
