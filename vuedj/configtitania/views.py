from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import list_route

from .models import User, Schema
from .serializers import UserSerializer, SchemaSerializer

import common, sqlite3, subprocess

@csrf_exempt
def handle_config(request):
    """
    List all code snippets, or create a new snippet.
    """
    if request.method == 'POST':
        action = request.POST.get("_action")
        if action == 'getSchema':
            print(action)
            queryset = Schema.objects.all()
            schemaSet = len(queryset)
            if schemaSet == 0:
                setSchema = Schema(version=common.VERSION, major_version=common.MAJOR_VERSION, minor_version=common.MINOR_VERSION)
                setSchema.save()
                print('saved schema')
            serializer = SchemaSerializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)
        elif action == 'getUserDetails':
            print(action)
            queryset = User.objects.all()
            serializer = UserSerializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)
        elif action == 'saveUserDetails':
            print(action)
            boxname = request.POST.get("boxname")
            username = request.POST.get("username")
            password = request.POST.get("password")
            setUser = User(boxname=boxname, username=username, password=password)
            setUser.save()
            return JsonResponse([{"STATUS":"SUCCESS"},{"RESPONSE":"Config saved successfully"}], safe=False)
        elif action == 'login':
            print(action)
            username = request.POST.get("username")
            password = request.POST.get("password")
            print(username+' '+password)
            queryset = User.objects.all().first()
            if username == queryset.username and password == queryset.password:
                return JsonResponse({"STATUS":"SUCCESS", "username":queryset.username}, safe=False)
            else:
                return JsonResponse({"STATUS":"FAILURE"}, safe=False)
        elif action == 'logout':
            print(action)
            username = request.POST.get("username")
            print(username+' ')
            queryset = User.objects.all().first()
            if username == queryset.username:
                return JsonResponse({"STATUS":"SUCCESS", "username":queryset.username}, safe=False)
        elif action == 'getDashboardCards':
            print(action)
            con = sqlite3.connect("dashboard.sqlite3")
            cursor = con.cursor()
            cursor.execute(common.Q_DASHBOARD_CARDS)
            rows = cursor.fetchall()
            print(rows)
            return JsonResponse(rows, safe=False)
        elif action == 'getDashboardChart':
            print(action)
            con = sqlite3.connect("dashboard.sqlite3")
            cursor = con.cursor()
            cursor.execute(common.Q_GET_CONTAINER_ID)
            rows = cursor.fetchall()
            print(rows)
            finalset = []
            for row in rows:
                cursor.execute(common.Q_GET_DASHBOARD_CHART,[row[0],])
                datasets = cursor.fetchall()
                print(datasets)
                data = {'container_name' : row[1], 'data': datasets}
                finalset.append(data)
            return JsonResponse(finalset, safe=False)
        elif action == 'getDockerOverview':
            print(action)
            con = sqlite3.connect("dashboard.sqlite3")
            cursor = con.cursor()
            cursor.execute(common.Q_GET_DOCKER_OVERVIEW)
            rows = cursor.fetchall()
            print(rows)
            finalset = []
            for row in rows:
                data = {'state': row[0], 'container_id': row[1], 'name': row[2],
                        'image': row[3], 'running_for': row[4],
                        'command': row[5], 'ports': row[6],
                        'status': row[7], 'networks': row[8]}
                finalset.append(data)
            return JsonResponse(finalset, safe=False)
        elif action == 'getContainerStats':
            print(action)
            con = sqlite3.connect("dashboard.sqlite3")
            cursor = con.cursor()
            cursor.execute(common.Q_GET_CONTAINER_ID)
            rows = cursor.fetchall()
            print(rows)
            finalset = []
            datasets = []
            for row in rows:
                for iter in range(6):
                    cursor.execute(common.Q_GET_CONTAINER_STATS,[row[0],iter])
                    counter_val = cursor.fetchall()
                    counter_row = {common.DOCKER_COUNTER_NAMES[iter] : counter_val}
                    print(counter_row)
                    datasets.append(counter_row)
                data = {'container_name' : row[1], 'data': datasets}
                datasets = []
                finalset.append(data)
            return JsonResponse(finalset, safe=False)
        elif action == 'getThreads':
            print(action)
            rows = []
            ps = subprocess.Popen(['ps', 'aux'], stdout=subprocess.PIPE).communicate()[0]
            processes = ps.decode().split('\n')
            # this specifies the number of splits, so the splitted lines
            # will have (nfields+1) elements
            nfields = len(processes[0].split()) - 1
            for row in processes[1:]:
                rows.append(row.split(None, nfields))
            return JsonResponse(rows, safe=False)
        return JsonResponse(serializer.errors, status=400)

def index(request):
    return render(request, 'index.html')

#not being used
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

#not being used
class SchemaViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    """Setting Schema"""
    # # setSchema = Schema(version=common.VERSION, major_version=common.MAJOR_VERSION, minor_version=common.MINOR_VERSION)
    # # setSchema.save()
    #
    # queryset = Schema.objects.all()
    # serializer_class = SchemaSerializer
